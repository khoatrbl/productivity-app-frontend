import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TaskDto } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import TaskCard from "../TaskCard/TaskCard";
import SwipeToDelete from "../SwipeToDelete/SwipeToDelete";
import { useSanctuary } from "../../context/SanctuaryContext";
import { getTasks } from "../../services/taskServices";
import CollapsedTaskCardSkeleton from "../TaskCard/CollapsedTaskCardSkeleton";

const START_TASK_XP = 15;

function TaskBoard() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Tracks which tasks have already paid out the one-time start bonus,
  // so pause -> restart can't be farmed for repeat +15 XP.
  const [startedTaskIds, setStartedTaskIds] = useState<Set<string>>(new Set());
  const { addExp } = useSanctuary();
  const isAnyTaskActive = tasks.some((t) => t.status === TaskStatus.IN_PROGRESS);

  useEffect(() => {
    getTasks()
    .then((data) => {setTasks(data); console.log(data)})
    .catch((err) => {setError(err.message ?? "Failed to load tasks.")})
    .finally(() => {setIsLoading(false)})
  })

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

  function updateStatus(id: string, status: TaskDto["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function handleStart(task: TaskDto) {
    updateStatus(task.id, TaskStatus.IN_PROGRESS);

    if (!startedTaskIds.has(task.id)) {
      addExp(START_TASK_XP);
      setStartedTaskIds((prev) => new Set(prev).add(task.id));
    }
  }

  function handleFinish(task: TaskDto) {
    updateStatus(task.id, TaskStatus.COMPLETE);
    addExp(task.totalExp);
  }

  function toggleSubtask(taskId: string, subtaskIndex: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubTasks = t.subTasks.map((s, i) =>
          i === subtaskIndex ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...t, subTasks: updatedSubTasks };
      })
    );
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            style={{ zIndex: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <SwipeToDelete onDelete={() => handleDelete(task.id)}>
              <TaskCard
                task={task}
                isAnyTaskActive={isAnyTaskActive}
                isForcedExpanded={index === 0}
                hasEarnedStartXp={startedTaskIds.has(task.id)}
                onStart={() => handleStart(task)}
                onPause={() => updateStatus(task.id, TaskStatus.INCOMPLETE)}
                onFinish={() => handleFinish(task)}
                onToggleSubtask={(subtaskIndex) => toggleSubtask(task.id, subtaskIndex)}
              />
            </SwipeToDelete>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskBoard;