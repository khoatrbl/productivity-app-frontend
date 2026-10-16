import { ChevronRight, Clock, Timer } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";
import { PRIORITY_DOT, PRIORITY_LABEL } from "../../constants/priority";

interface CalendarTaskCardProps {
  task: TaskDto;
  isOverdue?: boolean;
  onOpen: () => void;
}

function formatTime(dueTime?: string | null): string | null {
  if (!dueTime) return null;
  const [h, m] = dueTime.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function CalendarTaskCard({ task, isOverdue = false, onOpen }: CalendarTaskCardProps) {
  const time = formatTime(task.dueTime);
  const isActive = task.status === "IN_PROGRESS";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-3xl border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 active:scale-[0.99] ${
        isActive ? "border-emerald-200" : "border-gray-100"
      }`}
    >

      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />

      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${isOverdue ? "text-gray-500" : "text-gray-800"}`}>{task.title}</p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
          <span>{PRIORITY_LABEL[task.priority]}</span>
          {time && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400" : ""}`}>
              <Clock className="h-3 w-3" />
              {time}
            </span>
          )}
          {task.sprintInMinutes ? (
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {task.sprintInMinutes}m
            </span>
          ) : null}
        </div>
      </div>

      {isActive && (
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          In progress
        </span>
      )}

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </button>

    
  );
}

export default CalendarTaskCard;