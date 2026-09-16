import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TaskDto } from "../types/TaskCardData";
import { TaskStatus } from "../types/TaskStatus";
import { getTasks, updateTaskStatus } from "../services/taskServices";
import { useSanctuary } from "./SanctuaryContext";

const START_TASK_XP = 15;

interface TaskContextValue {
  tasks: TaskDto[]; // full list, including completed — kept for a future archive view
  visibleTasks: TaskDto[]; // excludes completed — what List View should render
  activeTask: TaskDto | null;
  isLoading: boolean;
  error: string | null;
  isAnyTaskActive: boolean;
  hasEarnedStartXp: (taskId: string) => boolean;
  handleStart: (task: TaskDto) => Promise<void>;
  handlePause: (task: TaskDto) => Promise<void>;
  handleFinish: (task: TaskDto) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskIndex: number) => void;
  handleDelete: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startedTaskIds, setStartedTaskIds] = useState<Set<string>>(new Set());
  const { addExp, addCoins } = useSanctuary();

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message ?? "Failed to load tasks."))
      .finally(() => setIsLoading(false));
  }, []);

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

      if (!startedTaskIds.has(task.taskId)) {
        await addExp(START_TASK_XP);
        setStartedTaskIds((prev) => new Set(prev).add(task.taskId));
      }
    } catch (err) {
      console.error("Failed to start task:", err);
    }
  }

  async function handleFinish(task: TaskDto) {
    try {
      const updated = await updateStatus(task.taskId, TaskStatus.COMPLETE);
      if (!updated) return;
      await addExp(task.totalExp);
      await addCoins(task.totalCoins);
    } catch (err) {
      console.error("Failed to finish task:", err);
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

  function handleDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
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
        hasEarnedStartXp: (taskId) => startedTaskIds.has(taskId),
        handleStart,
        handlePause,
        handleFinish,
        toggleSubtask,
        handleDelete,
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