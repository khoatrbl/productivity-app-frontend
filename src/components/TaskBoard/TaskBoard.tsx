import { AnimatePresence, motion } from "framer-motion";
import TaskCard from "../TaskCard/TaskCard";
import SwipeToDelete from "../SwipeToDelete/SwipeToDelete";
import CollapsedTaskCardSkeleton from "../TaskCard/CollapsedTaskCardSkeleton";
import { useTasks } from "../../context/TaskContext";

function TaskBoard() {
  const {
    visibleTasks, isLoading, error, isAnyTaskActive,
    hasEarnedStartXp, handleStart, handlePause, handleFinish,
    toggleSubtask, handleDelete,
  } = useTasks();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <CollapsedTaskCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {visibleTasks.map((task, index) => (
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
                hasEarnedStartXp={hasEarnedStartXp(task.taskId)}
                onStart={() => handleStart(task)}
                onPause={() => handlePause(task)}
                onFinish={() => handleFinish(task)}
                onToggleSubtask={(subtaskIndex) => toggleSubtask(task.taskId, subtaskIndex)}
              />
            </SwipeToDelete>
          </motion.div>
        ))}
      </AnimatePresence>

      {visibleTasks.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          Nothing on your plate right now — nice work, or add something new.
        </div>
      )}
    </div>
  );
}

export default TaskBoard;