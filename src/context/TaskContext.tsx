import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TaskDto } from "../types/TaskCardData";
import { TaskStatus } from "../types/TaskStatus";
import { createTask, deleteTask, getTasks, updateTask, updateTaskStatus } from "../services/taskServices";
import { useSanctuary } from "./UserProfileContext";
import type { UpdateTaskRequest } from "../types/UpdateTaskRequest";
import type { CreateTaskRequest } from "../types/CreateTaskRequest";

export interface TaskCompletion {
  id: string;
  title: string;
  expGained: number;
  coinsGained: number;
  bonusPets: number; // 0 for now; filled in when tasks can grant bonus pets
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
  toggleSubtask: (taskId: string, subtaskIndex: number) => void;
  handleDelete: (taskId: string) => void;
  handleUpdate: (taskId: string, payload: UpdateTaskRequest) => Promise<TaskDto | null>;
  handleCreate: (payload: CreateTaskRequest) => Promise<TaskDto | null>;
  completion: TaskCompletion | null;
  dismissCompletion: () => void;
  isCelebrationPending: boolean; // a finish is in progress or its overlay is open
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskStartTimes, setTaskStartTimes] = useState<Record<string, number>>({});
  const { addExp, addCoins, claimStartTaskReward } = useSanctuary();
  const [completion, setCompletion] = useState<TaskCompletion | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    getTasks()
      .then(setTasks)
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

  const isAnyTaskActive = tasks.some((t) => t.status === TaskStatus.IN_PROGRESS);
  const visibleTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETE);
  const activeTask = tasks.find((t) => t.status === TaskStatus.IN_PROGRESS) ?? null;

  async function updateStatus(taskId: string, status: TaskStatus): Promise<TaskDto | null> {
    if (!taskId) {
      console.error("updateStatus called with an empty taskId — aborting.");
      return null;
    }
    const updatedTask = await updateTaskStatus(taskId, status);
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updatedTask : t)));
    return updatedTask;
  }

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

      setCompletion({
        id: crypto.randomUUID(),
        title: task.title,
        expGained: task.totalExp,
        coinsGained: task.totalCoins,
        bonusPets: 0,
      });
    } finally {
      setIsFinishing(false);
    }
  }

  async function handlePause(task: TaskDto) {
    try {
      await updateStatus(task.taskId, TaskStatus.INCOMPLETE);
    } catch (err) {
      console.error("Failed to pause task:", err);
    }
  }

  function toggleSubtask(taskId: string, subtaskIndex: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.taskId !== taskId) return t;
        const updatedSubTasks = t.subTasks.map((s, i) =>
          i === subtaskIndex ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...t, subTasks: updatedSubTasks };
      })
    );
  }

  async function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));

    try {
      await deleteTask(taskId)
    } catch (err) {
      console.error("Failed to delete task: ", err);
    }
  }

  async function handleUpdate(taskId: string, payload: UpdateTaskRequest): Promise<TaskDto | null> {
    try {
      const updated = await updateTask(taskId, payload);
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
      return updated;
    } catch (err) {
      console.error("Failed to update task:", err);
      return null;
    }
  }

  async function handleCreate(payload: CreateTaskRequest): Promise<TaskDto | null> {
    try {
      const created = await createTask(payload);
      setTasks((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("Failed to create task:", err);
      return null;
    }
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
          const task = tasks.find(t => t.taskId === taskId);
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