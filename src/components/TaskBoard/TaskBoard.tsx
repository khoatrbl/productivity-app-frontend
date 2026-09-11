import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TaskCardData } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import TaskCard from "../TaskCard/TaskCard";
import SwipeToDelete from "../SwipeToDelete/SwipeToDelete";

interface TaskBoardProps {
  initialTasks: TaskCardData[];
}

function TaskBoard({ initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const isAnyTaskActive = tasks.some((t) => t.status === TaskStatus.IN_PROGRESS);

  function updateStatus(id: string, status: TaskCardData["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
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
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <SwipeToDelete onDelete={() => handleDelete(task.id)}>
              <TaskCard
                task={task}
                isAnyTaskActive={isAnyTaskActive}
                onStart={() => updateStatus(task.id, TaskStatus.IN_PROGRESS)}
                onPause={() => updateStatus(task.id, TaskStatus.INCOMPLETE)}
                onFinish={() => updateStatus(task.id, TaskStatus.COMPLETE)}
                onToggleSubtask={(index) => toggleSubtask(task.id, index)}
              />
            </SwipeToDelete>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskBoard;