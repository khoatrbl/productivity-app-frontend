import { ChevronRight, ListChecks, Sparkles, Coins } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";
import { formatDueDateTime } from "../../utils/taskFormatter";
import PriorityBadge from "../PriorityBadge/PriorityBadge";

interface CollapsedTaskCardProps {
  task: TaskDto;
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
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate font-medium text-gray-800">{task.title}</p>
          <div className="shrink-0">
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span className="whitespace-nowrap">{task.estimateMin}m</span>
          <span className="whitespace-nowrap">{formatDueDateTime(task.dueDate, task.dueTime)}</span>
          {task.subTasks.length > 0 && (
            <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <ListChecks className="h-3 w-3" />
              {task.subTasks.length} steps
            </span>
          )}
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            <Sparkles className="h-3 w-3" />
            {task.totalExp} XP
          </span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </button>
  );
}

export default CollapsedTaskCard;