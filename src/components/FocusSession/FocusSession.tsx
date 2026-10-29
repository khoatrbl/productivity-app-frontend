import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, PartyPopper, Wind } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";
import { useTasks } from "../../context/TaskContext";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function FocusTimer({ task, startedAt }: { task: TaskDto; startedAt: number }) {
  const totalSeconds = task.sprintInMinutes * 60;
  // No local elapsed state anymore — just a re-render pulse every second.
  // The actual elapsed value is always derived fresh from the real clock.
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [task.taskId]);

  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const remaining = totalSeconds - elapsed;
  const isOvertime = remaining <= 0;
  const progress = Math.min(elapsed / totalSeconds, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 176 176">
        <circle
          cx="88"
          cy="88"
          r={RADIUS}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="10"
        />
        <motion.circle
          cx="88"
          cy="88"
          r={RADIUS}
          fill="none"
          stroke={isOvertime ? "#9ca3af" : "#059669"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animate={{ strokeDashoffset: isOvertime ? 0 : dashOffset }}
          transition={{ duration: 0.6, ease: "linear" }}
        />
      </svg>

      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900">
          {isOvertime
            ? `+${formatClock(elapsed - totalSeconds)}`
            : formatClock(remaining)}
        </span>
        <span className="mt-1 text-xs text-gray-400">
          {isOvertime ? "past estimate — no rush" : "remaining"}
        </span>
      </div>
    </div>
  );
}

function CurrentStep({ task }: { task: TaskDto }) {
  const { toggleSubtask } = useTasks();
  const [pointer, setPointer] = useState(0);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  useEffect(() => {
    setPointer(0);
  }, [task.taskId]);

  const steps = task.subTasks;
  if (steps.length === 0) return null;

  const incompleteIndices = steps
    .map((s, i) => (s.isComplete ? -1 : i))
    .filter((i) => i !== -1);
  const doneCount = steps.length - incompleteIndices.length;
  const allDone = incompleteIndices.length === 0;

  // Pointer walks over the *unfinished* steps only, wrapping around on skip
  const currentIndex = allDone
    ? -1
    : incompleteIndices[pointer % incompleteIndices.length];
  const currentSub = allDone ? null : steps[currentIndex];
  const canSkip = incompleteIndices.length > 1;

  async function toggle(index: number) {
    if (busyIndex !== null) return; // ignore double taps while saving
    setBusyIndex(index);
    try {
      await toggleSubtask(task.taskId, index);
    } finally {
      setBusyIndex(null);
    }
  }

  function jumpTo(index: number) {
    const p = incompleteIndices.indexOf(index);
    if (p !== -1) setPointer(p);
  }

  return (
    <div className="w-full rounded-2xl bg-gray-50 p-4 text-left">
      {/* Header + progress */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {allDone ? "All steps" : "Current Step"}
        </p>
        <p className="text-[11px] font-medium text-gray-400">
          {doneCount}/{steps.length} done
        </p>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          animate={{ width: `${(doneCount / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait" initial={false}>
        {allDone ? (
          <motion.div
            key="all-done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-800"
          >
            <PartyPopper className="h-4 w-4" />
            All steps done, ready to finish!
          </motion.div>
        ) : (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mt-3"
          >
            <p className="text-center text-base font-medium text-gray-800">
              {currentSub!.content}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => toggle(currentIndex)}
                disabled={busyIndex !== null}
                className="flex items-center gap-1.5 rounded-full bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Mark done
              </button>
              {canSkip && (
                <button
                  type="button"
                  onClick={() => setPointer((p) => p + 1)}
                  className="flex items-center gap-0.5 rounded-full px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100"
                >
                  Skip <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All steps: tap a done one to undo, tap an open one to jump to it */}
      {steps.length > 1 && (
        <ul className="mt-4 space-y-1 border-t border-gray-200 pt-3">
          {steps.map((s, i) => {
            const isCurrent = i === currentIndex;
            return (
              <li key={s.id ?? i}>
                <button
                  type="button"
                  onClick={() => (s.isComplete ? toggle(i) : jumpTo(i))}
                  disabled={busyIndex === i}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                    isCurrent
                      ? "bg-white font-semibold text-gray-800"
                      : "text-gray-500 hover:bg-white/70"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      s.isComplete
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {s.isComplete && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span
                    className={`truncate ${s.isComplete ? "text-gray-400 line-through" : ""}`}
                  >
                    {s.content}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FocusSession() {
  const { activeTask, handleFinish, handlePause, getStartedAt } = useTasks();

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
        <Wind className="h-6 w-6 text-gray-300" />
        No task in focus right now.
        <span className="text-xs">
          Start a task from List View to begin a session.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-orange-200 bg-white p-6 text-center shadow-sm">
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
        Active Hyper-Focus
      </span>

      <h2 className="text-xl font-bold text-gray-900">{activeTask.title}</h2>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-500">
          {activeTask.priority}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-500">
          {activeTask.sprintInMinutes}m Sprint
        </span>
      </div>

      <CurrentStep task={activeTask} />
      <FocusTimer
        task={activeTask}
        startedAt={getStartedAt(activeTask.taskId) ?? Date.now()}
      />

      <button
        onClick={() => handleFinish(activeTask)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-800 py-3.5 text-sm font-semibold text-white hover:bg-emerald-900"
      >
        Finish Task (+{activeTask.totalExp} XP)
      </button>

      <button
        onClick={() => handlePause(activeTask)}
        className="text-sm font-medium text-gray-400 hover:text-gray-600"
      >
        Pause / Take a breath
      </button>
    </div>
  );
}

export default FocusSession;
