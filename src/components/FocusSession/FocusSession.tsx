import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Wind } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";
import { useTasks } from "../../context/TaskContext";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function FocusTimer({ task }: { task: TaskDto }) {
  const totalSeconds = task.estimateMin * 60;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
  }, [task.taskId]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [task.taskId]);

  const remaining = totalSeconds - elapsed;
  const isOvertime = remaining <= 0;
  const progress = Math.min(elapsed / totalSeconds, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 176 176">
        <circle cx="88" cy="88" r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <motion.circle
          cx="88" cy="88" r={RADIUS} fill="none"
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
          {isOvertime ? `+${formatClock(elapsed - totalSeconds)}` : formatClock(remaining)}
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
  const incompleteIndices = task.subTasks
    .map((s, i) => (s.isCompleted ? -1 : i))
    .filter((i) => i !== -1);

  const [pointer, setPointer] = useState(0);

  useEffect(() => {
    setPointer(0);
  }, [task.taskId]);

  if (task.subTasks.length === 0) return null;
  if (incompleteIndices.length === 0) return null;

  const clampedPointer = Math.min(pointer, incompleteIndices.length - 1);
  const currentIndex = incompleteIndices[clampedPointer];
  const currentSub = task.subTasks[currentIndex];
  const hasNext = clampedPointer < incompleteIndices.length - 1;

  return (
    <div className="w-full rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Current Step</p>
      <button
        onClick={() => toggleSubtask(task.taskId, currentIndex)}
        className="mt-1 text-left text-base text-gray-800 hover:text-gray-600"
      >
        {currentSub.content}
      </button>

      {hasNext && (
        <button
          onClick={() => setPointer((p) => p + 1)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
        >
          Next step
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FocusSession() {
  const { activeTask, handleFinish, handlePause } = useTasks();

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400">
        <Wind className="h-6 w-6 text-gray-300" />
        No task in focus right now.
        <span className="text-xs">Start a task from List View to begin a session.</span>
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
          {activeTask.estimateMin}m Sprint
        </span>
      </div>

      <CurrentStep task={activeTask} />
      <FocusTimer task={activeTask} />

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