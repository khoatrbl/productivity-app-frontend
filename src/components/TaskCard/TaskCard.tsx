import { useEffect, useState } from "react";
import type { TaskDto } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import ExpandedTaskCard from "./ExpandedTaskCard";
import CollapsedTaskCard from "./CollapsedTaskCard";

interface TaskCardProps {
  task: TaskDto;
  isAnyTaskActive: boolean;
  isForcedExpanded: boolean; // true for the first task in the list
  hasEarnedStartXp: boolean; // true once this task's one-time +15 XP has been claimed
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onToggleSubtask: (index: number) => void;
}

function TaskCard({
  task,
  isAnyTaskActive,
  isForcedExpanded,
  hasEarnedStartXp,
  onStart,
  onPause,
  onFinish,
  onToggleSubtask,
}: TaskCardProps) {
  // null = no manual choice yet, defer to default logic below.
  // true/false = user explicitly expanded/collapsed this card.
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  const isActiveTask = task.status === TaskStatus.IN_PROGRESS;

  // Starting a task always wins over any earlier manual collapse.
  useEffect(() => {
    if (isActiveTask) setUserOverride(null);
  }, [isActiveTask]);

  const defaultExpanded = isActiveTask || isForcedExpanded;
  const isExpanded = isActiveTask ? true : userOverride ?? defaultExpanded;
  const isCollapsible = !isActiveTask; // active task can't be collapsed at all

  function toggleExpanded() {
    setUserOverride(!isExpanded);
  }

  if (!isExpanded) {
    return <CollapsedTaskCard task={task} onExpand={toggleExpanded} />;
  }

  return (
    <ExpandedTaskCard
      task={task}
      isAnyTaskActive={isAnyTaskActive}
      isCollapsible={isCollapsible}
      hasEarnedStartXp={hasEarnedStartXp}
      onStart={onStart}
      onPause={onPause}
      onFinish={onFinish}
      onCollapse={toggleExpanded}
      onToggleSubtask={onToggleSubtask}
    />
  );
}

export default TaskCard;