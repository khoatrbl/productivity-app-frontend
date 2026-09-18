import { CheckCircle2, Circle, ListChecks, ChevronUp, Sparkles, Coins, Clock, CalendarDays } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";
import { TaskStatus } from "../../types/TaskStatus";
import { formatDueDateTime } from "../../utils/taskFormatter";
import PriorityBadge from "../PriorityBadge/PriorityBadge";

const START_TASK_XP = 15;

interface ExpandedTaskCardProps {
  task: TaskDto;
  isAnyTaskActive: boolean;
  isCollapsible: boolean;
  hasEarnedStartXp: boolean;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onCollapse: () => void;
  onToggleSubtask: (index: number) => void;
}

function ExpandedTaskCard({
  task,
  isAnyTaskActive,
  isCollapsible,
  hasEarnedStartXp,
  onStart,
  onPause,
  onFinish,
  onCollapse,
  onToggleSubtask,
}: ExpandedTaskCardProps) {
  const completedCount = task.subTasks.filter((s) => s.isCompleted).length;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;
  const isComplete = task.status === TaskStatus.COMPLETE;
  const hasSubtasks = task.subTasks.length > 0;

  return (
    <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-orange-400" />
          {isInProgress && (
            <span className="text-xs font-semibold tracking-wide text-orange-500">FOCUSING NOW</span>
          )}
          {!isInProgress && !isComplete && (
            <span className="text-xs font-semibold tracking-wide text-orange-500">READY TO TACKLE</span>
          )}
        </div>

        <div className="inline-flex justify-around gap-1">
          <PriorityBadge priority={task.priority} />

          {isCollapsible && (
            <button
              onClick={onCollapse}
              aria-label="Collapse task"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-2 text-xl font-semibold leading-snug text-gray-900">{task.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{task.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Est. {task.estimateMin} min
        </span>
        <span className="flex items-center gap-1 text-red-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDueDateTime(task.dueDate, task.dueTime)}
        </span>
        <span className="flex items-center gap-1 text-emerald-600">
          <Sparkles className="h-3.5 w-3.5" />
          {task.totalExp} XP
        </span>
        <span className="flex items-center gap-1 text-amber-600">
          <Coins className="h-3.5 w-3.5" />
          {task.totalCoins}
        </span>
      </div>

      {hasSubtasks && (
        <>
          <div className="my-4 border-t border-gray-100" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <ListChecks className="h-4 w-4" />
              Micro-Steps ({completedCount}/{task.subTasks.length})
            </div>
            {/* <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              +10 XP each
            </span> */}
          </div>

          <ul className="mt-3 space-y-2">
            {task.subTasks.map((sub, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onToggleSubtask(index)}
                  disabled={!isInProgress}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-colors ${
                    sub.isCompleted ? "bg-emerald-50" : "bg-gray-50 hover:bg-gray-100"
                  } disabled:cursor-not-allowed disabled:hover:bg-gray-50`}
                >
                  <div className="flex items-center gap-2">
                    {sub.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                    )}
                    <span className={`text-sm ${sub.isCompleted ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {sub.content}
                    </span>
                  </div>
                  <span className={`text-xs ${sub.isCompleted ? "text-gray-400" : "text-gray-500"}`}>
                    {sub.isCompleted ? `✓ +${sub.exp}` : `+${sub.exp} XP`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-5">
        {task.status === TaskStatus.INCOMPLETE && (
          <button
            onClick={onStart}
            disabled={isAnyTaskActive}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Task
            {!hasEarnedStartXp && <span className="text-emerald-200">+{START_TASK_XP} XP</span>}
          </button>
        )}

        {isInProgress && (
          <div className="flex gap-2">
            <button
              onClick={onPause}
              className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Pause
            </button>
            <button
              onClick={onFinish}
              className="flex flex-[2] items-center justify-center gap-1.5 rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Finish Task
              <span className="text-emerald-200">+{task.totalExp} XP</span>
            </button>
          </div>
        )}

        {isComplete && (
          <div className="w-full rounded-full bg-gray-100 py-3 text-center text-sm font-semibold text-gray-400">
            Completed
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpandedTaskCard;