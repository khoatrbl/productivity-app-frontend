import { useState } from "react";
import type { TaskCardData } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import ExpandedTaskCard from "./ExpandedTaskCard";
import CollapsedTaskCard from "./CollapsedTaskCard";

interface TaskCardProps {
  task: TaskCardData;
  isAnyTaskActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onToggleSubtask: (index: number) => void;
}

function TaskCard({ task, isAnyTaskActive, onStart, onPause, onFinish, onToggleSubtask }: TaskCardProps) {
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const isActiveTask = task.status === TaskStatus.IN_PROGRESS;
  const isExpanded = isActiveTask || manuallyExpanded;

  if (!isExpanded) {
    return <CollapsedTaskCard task={task} onExpand={() => setManuallyExpanded(true)} />;
  }

  return (
    <ExpandedTaskCard
      task={task}
      isAnyTaskActive={isAnyTaskActive}
      isCollapsible={!isActiveTask}
      onStart={onStart}
      onPause={onPause}
      onFinish={onFinish}
      onCollapse={() => setManuallyExpanded(false)}
      onToggleSubtask={onToggleSubtask}
    />
  );
}

export default TaskCard;