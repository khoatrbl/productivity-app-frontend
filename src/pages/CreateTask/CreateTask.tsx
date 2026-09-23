// pages/CreateTask/CreateTask.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Coins, ChevronLeft } from "lucide-react";
import PrioritySelector from "../../components/CreateTask/PrioritySelector";
import DueDateSection from "../../components/CreateTask/DueDateSection";
import DueTimeSection from "../../components/CreateTask/DueTimeSection";
import SprintDurationSection from "../../components/CreateTask/SprintDurationSection";
import MicroStepsEditor from "../../components/CreateTask/MicroStepsEditor";
import { createTask } from "../../services/taskServices";
import { useRewardEstimate } from "../../hooks/useRewardEstimate";
import type { TaskPriority } from "../../types/TaskPriority";

import appLogo from "../../assets/capydo-logo-512x512.png"

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CreateTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState(() => new Date());
  const [hour24, setHour24] = useState(18);
  const [minute, setMinute] = useState(0);
  const [sprintInMinutes, setSprintInMinutes] = useState(20);
  const [steps, setSteps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { estimate, isLoading: isEstimating, isReady } = useRewardEstimate(title, priority, steps.length);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Give your quest a title first.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: formatLocalDate(dueDate),
        dueTime: `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        priority,
        sprintInMinutes,
        subTasks: steps.filter((s) => s.trim()).map((content, position) => ({ content: content.trim(), position })),
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the task — try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-bold text-gray-900">New Task</p>
        <div className="w-5" />
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quest Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you tackling?"
            className="mt-1.5 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A quick note about this task"
            rows={2}
            className="mt-1.5 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-300"
          />
        </div>

        <MicroStepsEditor steps={steps} onChange={setSteps} />
        <PrioritySelector value={priority} onChange={setPriority} />
        <DueDateSection value={dueDate} onChange={setDueDate} />
        <DueTimeSection hour24={hour24} minute={minute} onChange={(h, m) => { setHour24(h); setMinute(m); }} />
        <SprintDurationSection value={sprintInMinutes} onChange={setSprintInMinutes} />

        <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Expected Bounty</span>
          {!isReady ? (
            <span className="text-xs text-amber-400">Add a title to preview</span>
          ) : isEstimating ? (
            <span className="text-xs text-amber-500">Calculating...</span>
          ) : estimate ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-amber-700">
              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />+{estimate.totalExp} XP</span>
              <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5" />{estimate.totalCoins}</span>
            </div>
          ) : (
            <span className="text-xs text-amber-400">—</span>
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2 border-t border-gray-100 bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-600">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {isSubmitting ? "Creating..." : "Create Quest"}
        </button>
      </div>
    </div>
  );
}

export default CreateTask;