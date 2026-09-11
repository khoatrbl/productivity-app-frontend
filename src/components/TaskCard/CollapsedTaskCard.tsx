import { ChevronRight, ListChecks } from "lucide-react";
import type { TaskCardData } from "../../types/TaskCardData";
import { formatDueDateTime } from "../../utils/taskFormatter";

interface CollapsedTaskCardProps {
  task: TaskCardData;
  onExpand: () => void;
}

function CollapsedTaskCard({ task, onExpand }: CollapsedTaskCardProps) {
  return (
    <button
      onClick={onExpand}
      className="flex w-full items-center gap-3 rounded-3xl border border-gray-100 bg-white px-4 py-3.5 text-left shadow-sm"
    >
      <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-800">{task.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
          <span>{task.estimateMin}m</span>
          <span>{formatDueDateTime(task.dueDate, task.dueTime)}</span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            <ListChecks className="h-3 w-3" />
            {task.subTasks.length} steps
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </button>
  );
}

export default CollapsedTaskCard;