import { AnimatePresence, motion } from "framer-motion";
import TaskCard from "../TaskCard/TaskCard";
import CollapsedTaskCardSkeleton from "../TaskCard/CollapsedTaskCardSkeleton";
import { useTasks } from "../../context/TaskContext";
import SwipeActions from "../SwipeActions/SwipeActions";
import { useNavigate } from "react-router-dom";
import type { PriorityFilter } from "../PriorityFilterTabs/PriorityFilterTabs";
import { sortByCreatedAt, sortByPriorityThenCreated } from "../../utils/taskSort";
import { useMemo } from "react";

import restingCapybara from "../../assets/resting_capybara.png"
import chillingCapybara from "../../assets/chilling_capybara.png"

interface TaskBoardProps {
  priorityFilter: PriorityFilter;
}

function TaskBoard({ priorityFilter }: TaskBoardProps) {
  const navigate = useNavigate();
  const {
    visibleTasks, isLoading, error, isAnyTaskActive,
    hasEarnedStartXp, handleStart, handlePause, handleFinish,
    toggleSubtask, handleDelete,
  } = useTasks();

  const displayedTasks = useMemo(() => {
    if (priorityFilter === "HIGH_URGENT") {
      return sortByPriorityThenCreated(visibleTasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH"));
    }
    if (priorityFilter === "MEDIUM") {
      return sortByCreatedAt(visibleTasks.filter((t) => t.priority === "MEDIUM"));
    }
    if (priorityFilter === "LOW") {
      return sortByCreatedAt(visibleTasks.filter((t) => t.priority === "LOW"));
    }
    return sortByCreatedAt(visibleTasks); // ALL
  }, [visibleTasks, priorityFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, index) => <CollapsedTaskCardSkeleton key={index} />)}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {displayedTasks.map((task, index) => (
          <motion.div key={task.taskId} layout style={{ zIndex: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <SwipeActions onDelete={() => handleDelete(task.taskId)} onEdit={() => navigate(`/tasks/${task.taskId}/edit`)}>
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
            </SwipeActions>
          </motion.div>
        ))}
      </AnimatePresence>

      {displayedTasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-12 text-center">
          {/* <span className="text-3xl">🦫</span> */}
          {visibleTasks.length === 0
            ? <img src={chillingCapybara} className="w-35"/> 
            : <></>
          }
          
          <p className="text-base font-semibold text-emerald-800">
            {visibleTasks.length === 0 ? "You're done for today" : "Nothing here for this filter"}
          </p>
          <p className="max-w-[220px] text-sm text-gray-400">
            {visibleTasks.length === 0
              ? "Nothing left on your plate. Rest easy, or add something new whenever you're ready."
              : "Try a different tab, or clear the filter to see everything."}
          </p>
        </div>
      )}
    </div>
  );
}

export default TaskBoard;