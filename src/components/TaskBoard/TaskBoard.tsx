import { AnimatePresence, motion } from "framer-motion";
import TaskCard from "../TaskCard/TaskCard";
import CollapsedTaskCardSkeleton from "../TaskCard/CollapsedTaskCardSkeleton";
import { useTasks } from "../../context/TaskContext";
import SwipeActions from "../SwipeActions/SwipeActions";
import { useLocation, useNavigate } from "react-router-dom";
import type { PriorityFilter } from "../PriorityFilterTabs/PriorityFilterTabs";
import { activeFirst, sortByCreatedAt, sortByPriorityThenCreated } from "../../utils/taskSort";
import { useEffect, useRef, useMemo, useState } from "react";

import restingCapybara from "../../assets/resting_capybara.png";
import chillingCapybara from "../../assets/chilling_capybara.png";

interface TaskBoardProps {
  priorityFilter: PriorityFilter;
  onPriorityFilterChange?: (filter: PriorityFilter) => void;
}

function TaskBoard({ priorityFilter, onPriorityFilterChange }: TaskBoardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  const {
    visibleTasks, isLoading, error, isAnyTaskActive,
    hasEarnedStartXp, handleStart, handlePause, handleFinish,
    toggleSubtask, handleDelete,
  } = useTasks();

  const displayedTasks = useMemo(() => {
    if (priorityFilter === "HIGH_URGENT") {
      return activeFirst(
        sortByPriorityThenCreated(visibleTasks.filter((t) => t.priority === "URGENT" || t.priority === "HIGH"))
      );
    }
    if (priorityFilter === "MEDIUM") {
      return activeFirst(sortByCreatedAt(visibleTasks.filter((t) => t.priority === "MEDIUM")));
    }
    if (priorityFilter === "LOW") {
      return activeFirst(sortByCreatedAt(visibleTasks.filter((t) => t.priority === "LOW")));
    }
    return activeFirst(sortByPriorityThenCreated(visibleTasks)); // ALL
  }, [visibleTasks, priorityFilter]);

  // 1. Arriving from the calendar: pick up the task id once, then clear router state
  useEffect(() => {
    const targetId = (location.state as { expandTaskId?: string } | null)?.expandTaskId;
    if (targetId == null || isLoading) return;

    setFocusedTaskId(targetId);
    navigate(location.pathname, { replace: true, state: null }); // refresh/back won't re-trigger
  }, [location.state, isLoading]);

  // 2. Make sure the focused task is visible under the current filter
  useEffect(() => {
    if (focusedTaskId == null) return;
    const isShown = displayedTasks.some((t) => t.taskId === focusedTaskId);
    if (!isShown && priorityFilter !== "ALL") onPriorityFilterChange?.("ALL");
  }, [focusedTaskId, displayedTasks, priorityFilter]);

  // 3. Scroll to it once it's rendered (small delay lets the expand/layout animation start)
  useEffect(() => {
    if (focusedTaskId == null) return;
    const timer = setTimeout(() => {
      cardRefs.current.get(focusedTaskId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
  }, [focusedTaskId, displayedTasks]);

  // Drop the focus if the task disappears (finished/deleted)
  useEffect(() => {
    if (focusedTaskId != null && !visibleTasks.some((t) => t.taskId === focusedTaskId)) {
      setFocusedTaskId(null);
    }
  }, [visibleTasks, focusedTaskId]);

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
          <motion.div
            key={task.taskId}
            ref={(el) => {
              if (el) cardRefs.current.set(task.taskId, el);
              else cardRefs.current.delete(task.taskId);
            }}
            layout
            style={{ zIndex: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
            className={`overflow-hidden rounded-3xl ${
              task.taskId === focusedTaskId ? "ring-2 ring-emerald-300 ring-offset-2 ring-offset-[#fcf8f2]" : ""
            }`}
          >
            <SwipeActions onDelete={() => handleDelete(task.taskId)} onEdit={() => navigate(`/tasks/${task.taskId}/edit`)}>
              <TaskCard
                task={task}
                isAnyTaskActive={isAnyTaskActive}
                isForcedExpanded={index === 0 || task.taskId === focusedTaskId}
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
          {visibleTasks.length === 0
            ? <img src={chillingCapybara} className="w-35" />
            : <img src={restingCapybara} className="w-35" />}

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