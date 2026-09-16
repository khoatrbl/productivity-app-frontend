import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TaskDto } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import TaskCard from "../TaskCard/TaskCard";
import SwipeToDelete from "../SwipeToDelete/SwipeToDelete";
import { useSanctuary } from "../../context/SanctuaryContext";
import { getTasks, updateTaskStatus } from "../../services/taskServices";
import CollapsedTaskCardSkeleton from "../TaskCard/CollapsedTaskCardSkeleton";

const START_TASK_XP = 15;

function TaskBoard() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Tracks which tasks have already paid out the one-time start bonus,
  // so pause -> restart can't be farmed for repeat +15 XP.
  const [startedTaskIds, setStartedTaskIds] = useState<Set<string>>(new Set());
  const { addExp, addCoins } = useSanctuary();
  const isAnyTaskActive = tasks.some((t) => t.status === TaskStatus.IN_PROGRESS);

  useEffect(() => {
    getTasks()
    .then((data) => {setTasks(data)})
    .catch((err) => {setError(err.message ?? "Failed to load tasks.")})
    .finally(() => {setIsLoading(false)})
  }, [])

  if (isLoading) {
    return (
      <div className = "flex flex-col gap-3">
        {Array.from({length: 6}, (_, index) => (
          <CollapsedTaskCardSkeleton key={index}/>
        ))}
      </div>
    )
  }

  if (error) {
    return <div>{error}</div>
  }

  async function updateStatus(taskId: string, taskStatus: TaskStatus): Promise<TaskDto | null> {
  if (!taskId) {
    console.error("updateStatus called with an empty taskId — aborting.");
    return null;
  }
  const updatedTask = await updateTaskStatus(taskId, taskStatus);
  
  setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updatedTask : t)));
  return updatedTask;
}

  async function handleStart(task: TaskDto) {
    try {
      const updatedTask = await updateStatus(task.taskId, TaskStatus.IN_PROGRESS);

      if (!updatedTask) {
        return;
      }

      if (!startedTaskIds.has(task.taskId)) {
        await addExp(START_TASK_XP);
        setStartedTaskIds((prev) => {
          const updated = new Set(prev);

          updated.add(task.taskId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to handle start: ", error);
    }
  }

  async function handleFinish(task: TaskDto) {
    try {
      const updatedTask = await updateStatus(task.taskId, TaskStatus.COMPLETE);

      if (!updatedTask) return;

      await addExp(task.totalExp);
      await addCoins(task.totalCoins);
    } catch (error) {
      console.error("Failed to handle finish: ", error);
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

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.taskId !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {tasks.map((task, index) => (
          <motion.div
            key={task.taskId}
            layout
            style={{ zIndex: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <SwipeToDelete onDelete={() => handleDelete(task.taskId)}>
              <TaskCard
                task={task}
                isAnyTaskActive={isAnyTaskActive}
                isForcedExpanded={index === 0}
                hasEarnedStartXp={startedTaskIds.has(task.taskId)}
                onStart={() => handleStart(task)}
                onPause={() => updateStatus(task.taskId, TaskStatus.INCOMPLETE)}
                onFinish={() => handleFinish(task)}
                onToggleSubtask={(subtaskIndex) => toggleSubtask(task.taskId, subtaskIndex)}
              />
            </SwipeToDelete>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskBoard;