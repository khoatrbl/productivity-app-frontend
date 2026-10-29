import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TaskDto } from "../types/TaskCardData";
import { TaskStatus } from "../types/TaskStatus";
import {
  createTask,
  deleteTask,
  getTasks,
  updateSubTaskStatus,
  updateTask,
  updateTaskStatus,
} from "../services/taskServices";
import { useUserProfileContext } from "./UserProfileContext";
import type { UpdateTaskRequest } from "../types/UpdateTaskRequest";
import type { CreateTaskRequest } from "../types/CreateTaskRequest";
import { usePet } from "./PetContext";

export interface TaskCompletion {
  id: string;
  title: string;
  expGained: number;
  coinsGained: number;
  bonusPets: number;
}

interface TaskContextValue {
  tasks: TaskDto[];
  visibleTasks: TaskDto[];
  activeTask: TaskDto | null;
  isLoading: boolean;
  error: string | null;
  isAnyTaskActive: boolean;
  hasEarnedStartXp: (taskId: string) => boolean;
  getStartedAt: (taskId: string) => number | undefined;
  handleStart: (task: TaskDto) => Promise<void>;
  handlePause: (task: TaskDto) => Promise<void>;
  handleFinish: (task: TaskDto) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskIndex: number) => Promise<void>;
  handleDelete: (taskId: string) => void;
  handleCreate: (payload: CreateTaskRequest) => Promise<TaskDto>;
  handleUpdate: (
    taskId: string,
    payload: UpdateTaskRequest,
  ) => Promise<TaskDto>;
  completion: TaskCompletion | null;
  dismissCompletion: () => void;
  isCelebrationPending: boolean; // a finish is in progress or its overlay is open
}

// Subtasks always live in state sorted by position, so every consumer
// (cards, focus mode, editor, toggleSubtask's index) sees the same order.
function withSortedSubtasks(task: TaskDto): TaskDto {
  return {
    ...task,
    subTasks: [...task.subTasks].sort((a, b) => a.position - b.position),
  };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskStartTimes, setTaskStartTimes] = useState<Record<string, number>>(
    {},
  );
  const [completion, setCompletion] = useState<TaskCompletion | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const { addExp, addCoins, claimStartTaskReward } = useUserProfileContext();
  const { refreshPet } = usePet();

  // Subtask saves still in flight, per task. Pause/finish wait for these so a
  // status response can't overwrite a toggle the server hasn't committed yet.
  const pendingSubtaskSaves = useRef(new Map<string, Set<Promise<unknown>>>());

  useEffect(() => {
    getTasks()
      .then((list) => setTasks(list.map(withSortedSubtasks)))
      .catch((err) => setError(err.message ?? "Failed to load tasks."))
      .finally(() => setIsLoading(false));
  }, []);

  // Backfill a start time for any task that's already IN_PROGRESS when we
  // first see it (e.g. a page refresh mid-task) but only ONCE per task —
  // this must never overwrite an existing timestamp on a later tasks update,
  // or every unrelated state change (like toggling a subtask) would reset it.
  useEffect(() => {
    setTaskStartTimes((prev) => {
      let changed = false;
      const next = { ...prev };
      tasks.forEach((t) => {
        if (t.status === TaskStatus.IN_PROGRESS && !(t.taskId in next)) {
          next[t.taskId] = Date.now();
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [tasks]);

  const isAnyTaskActive = tasks.some(
    (t) => t.status === TaskStatus.IN_PROGRESS,
  );
  const visibleTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETE);
  const activeTask =
    tasks.find((t) => t.status === TaskStatus.IN_PROGRESS) ?? null;

  /* ---------- helpers ---------- */

  function trackSubtaskSave(taskId: string, promise: Promise<unknown>) {
    const set = pendingSubtaskSaves.current.get(taskId) ?? new Set();
    set.add(promise);
    pendingSubtaskSaves.current.set(taskId, set);
    promise.finally(() => set.delete(promise));
  }

  async function waitForSubtaskSaves(taskId: string) {
    const set = pendingSubtaskSaves.current.get(taskId);
    if (set && set.size > 0) await Promise.allSettled([...set]);
  }

  async function updateStatus(
    taskId: string,
    status: TaskStatus,
  ): Promise<TaskDto | null> {
    if (!taskId) {
      console.error("updateStatus called with an empty taskId — aborting.");
      return null;
    }
    const updatedTask = withSortedSubtasks(
      await updateTaskStatus(taskId, status),
    );
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? updatedTask : t)),
    );
    return updatedTask;
  }

  /* ---------- status actions ---------- */

  async function handleStart(task: TaskDto) {
    try {
      const updated = await updateStatus(task.taskId, TaskStatus.IN_PROGRESS);
      if (!updated) return;

      // Fresh timer every time a task is (re)started — consistent with pause
      // fully releasing the active slot rather than truly "resuming."
      setTaskStartTimes((prev) => ({ ...prev, [task.taskId]: Date.now() }));

      if (updated.startExpClaimed === false) {
        await claimStartTaskReward(task.taskId);
      }
    } catch (err) {
      console.error("Failed to start task:", err);
    }
  }

  async function handleFinish(task: TaskDto) {
    setIsFinishing(true);
    try {
      await waitForSubtaskSaves(task.taskId);

      let updated: TaskDto | null = null;
      try {
        updated = await updateStatus(task.taskId, TaskStatus.COMPLETE);
      } catch (err) {
        console.error("Failed to finish task:", err);
        return;
      }
      if (!updated) return;

      try {
        await addExp(task.totalExp);
      } catch (err) {
        console.error("Failed to add EXP:", err);
      }
      try {
        await addCoins(task.totalCoins);
      } catch (err) {
        console.error("Failed to add coins:", err);
      }

      const bonusPets = updated.bonusPetsGranted ?? 0;
      if (bonusPets > 0) {
        try {
          await refreshPet(); // the Sanctuary picks up the new bonus pets and stream
        } catch (err) {
          console.error("Failed to refresh pet:", err);
        }
      }

      setCompletion({
        id: crypto.randomUUID(),
        title: task.title,
        expGained: task.totalExp,
        coinsGained: task.totalCoins,
        bonusPets,
      });
    } finally {
      setIsFinishing(false);
    }
  }

  async function handlePause(task: TaskDto) {
    try {
      await waitForSubtaskSaves(task.taskId);
      await updateStatus(task.taskId, TaskStatus.INCOMPLETE);
    } catch (err) {
      console.error("Failed to pause task:", err);
    }
  }

  /* ---------- subtasks ---------- */

  async function toggleSubtask(
    taskId: string,
    subtaskIndex: number,
  ): Promise<void> {
    const task = tasks.find((t) => t.taskId === taskId);
    const target = task?.subTasks[subtaskIndex];
    if (!task || !target) return;

    const subTaskId = target.id;
    const nextValue = !target.isComplete;

    // Optimistic: flip it immediately (by id, so concurrent toggles don't clash)
    const setSubtask = (value: boolean) =>
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId !== taskId
            ? t
            : {
                ...t,
                subTasks: t.subTasks.map((s) =>
                  s.id === subTaskId ? { ...s, isComplete: value } : s,
                ),
              },
        ),
      );

    setSubtask(nextValue);

    const request = updateSubTaskStatus(taskId, subTaskId, nextValue);
    trackSubtaskSave(taskId, request);

    try {
      await request;
    } catch (err) {
      console.error("Failed to update subtask:", err);
      setSubtask(!nextValue); // roll back
    }
  }

  /* ---------- CRUD ---------- */

  async function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task: ", err);
    }
  }

  async function handleUpdate(
    taskId: string,
    payload: UpdateTaskRequest,
  ): Promise<TaskDto> {
    const updated = withSortedSubtasks(await updateTask(taskId, payload)); // throws ApiError on failure
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
    return updated;
  }

  async function handleCreate(payload: CreateTaskRequest): Promise<TaskDto> {
    const created = withSortedSubtasks(await createTask(payload)); // throws ApiError on failure
    setTasks((prev) => [...prev, created]);
    return created;
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        visibleTasks,
        activeTask,
        isLoading,
        error,
        isAnyTaskActive,
        hasEarnedStartXp: (taskId) => {
          const task = tasks.find((t) => t.taskId === taskId);
          return task?.startExpClaimed ?? false;
        },
        getStartedAt: (taskId) => taskStartTimes[taskId],
        handleCreate,
        handleStart,
        handleUpdate,
        handlePause,
        handleFinish,
        toggleSubtask,
        handleDelete,
        completion,
        dismissCompletion: () => setCompletion(null),
        isCelebrationPending: isFinishing || completion !== null,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within a TaskProvider");
  return ctx;
}
