// pages/CreateTask/CreateTask.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Coins, ChevronLeft } from "lucide-react";
import PrioritySelector from "../../components/CreateTask/PrioritySelector";
import DueDateSection from "../../components/CreateTask/DueDateSection";
import DueTimeSection from "../../components/CreateTask/DueTimeSection";
import SprintDurationSection from "../../components/CreateTask/SprintDurationSection";
import MicroStepsEditor from "../../components/CreateTask/MicroStepsEditor";
import CharCounter from "../../components/CharCounter/CharCounter";
import { useRewardEstimate } from "../../hooks/useRewardEstimate";
import type { TaskPriority } from "../../types/TaskPriority";
import { useTasks } from "../../context/TaskContext";
import { useUserProfileContext } from "../../context/UserProfileContext";
import { ApiError } from "../../lib/apiClient";
import { fromDateKey, toDateKey } from "../../utils/calendar";
import {
  TASK_DESCRIPTION_MAX,
  TASK_TITLE_MAX,
} from "../../constants/taskLimit";
import defaultAvatar from "../../assets/angry_capybara_working.jpg";
import capyCozyTip from "../../assets/capy_cozy_tip.png";
import appLogo from "../../assets/capydo-logo-512x512.png";

// Friendly names for backend field errors that don't have an inline spot
const FIELD_LABELS: Record<string, string> = {
  dueDate: "Due date",
  dueTime: "Due time",
  priority: "Priority",
  sprintInMinutes: "Sprint length",
  subTasks: "Micro-steps",
};

const INLINE_FIELDS = new Set(["title", "description"]);

type CreateTaskNavState = { dueDate?: string; returnTo?: string } | null;

function CreateTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as CreateTaskNavState;

  const { handleCreate } = useTasks();
  const { avatarUrl } = useUserProfileContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  // "15 minutes from now", computed once (carries into the hour and day automatically)
  const [initial] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d;
  });
  const [dueDate, setDueDate] = useState<Date>(() =>
    navState?.dueDate ? fromDateKey(navState.dueDate) : initial,
  );
  const [hour24, setHour24] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());

  const [sprintInMinutes, setSprintInMinutes] = useState(20);
  const [steps, setSteps] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    estimate,
    isLoading: isEstimating,
    isReady,
  } = useRewardEstimate(title, priority, steps.length);

  const otherFieldErrors = Object.entries(fieldErrors).filter(
    ([field]) => !INLINE_FIELDS.has(field),
  );

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!title.trim()) {
      setFieldErrors({ title: "Give your quest a title first." });
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await handleCreate({
        title: title.trim(),
        description: description.trim() || "",
        dueDate: toDateKey(dueDate),
        dueTime: `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        priority,
        sprintInMinutes,
        subTasks: steps
          .filter((s) => s.trim())
          .map((content, position) => ({ content: content.trim(), position })),
      });
      navigate(navState?.returnTo ?? "/");
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;

      if (apiErr?.status === 400) {
        setFieldErrors(apiErr.fieldErrors ?? {});
        setError(
          apiErr.fieldErrors
            ? "Some details need fixing. Check the highlighted fields."
            : apiErr.message ||
                "Some details aren't valid. Please check and try again.",
        );
      } else if (apiErr?.status === 0) {
        setError(
          "Couldn't reach the server. Check your connection and try again.",
        );
      } else {
        setError("Couldn't create the task. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm">
            <img
              src={appLogo}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <p className="text-base font-bold text-gray-900">New Quest</p>
        </div>
        {avatarUrl ? (
          <img
            src={avatarUrl || defaultAvatar}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8" /> // keeps the title visually centered even with no avatar loaded yet
        )}
      </div>

      {/* Capy's Cozy Tip */}
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-3xl bg-gray-100 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl">
          <img
            src={capyCozyTip}
            alt=""
            className="h-11 w-11 rounded-full object-cover object-top"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">Capy's Cozy Tip</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              ADHD Gentle
            </span>
          </div>
          <p className="mt-1 text-sm leading-snug text-gray-500">
            Big tasks feel terrifying. Let's make it small enough to start
            effortlessly!
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="quest-title"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Quest Title
            </label>
            <CharCounter length={title.length} max={TASK_TITLE_MAX} />
          </div>
          <input
            id="quest-title"
            value={title}
            maxLength={TASK_TITLE_MAX}
            onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }}
            placeholder="What are you tackling?"
            aria-invalid={!!fieldErrors.title}
            className={`mt-1.5 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-300 ${
              fieldErrors.title ? "ring-2 ring-red-300" : ""
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {fieldErrors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="quest-description"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Description{" "}
              <span className="font-normal normal-case text-gray-400">
                (optional)
              </span>
            </label>
            <CharCounter
              length={description.length}
              max={TASK_DESCRIPTION_MAX}
              warnAt={50}
            />
          </div>
          <textarea
            id="quest-description"
            value={description}
            maxLength={TASK_DESCRIPTION_MAX}
            onChange={(e) => {
              setDescription(e.target.value);
              clearFieldError("description");
            }}
            placeholder="A quick note about this task"
            rows={2}
            aria-invalid={!!fieldErrors.description}
            className={`mt-1.5 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-300 ${
              fieldErrors.description ? "ring-2 ring-red-300" : ""
            }`}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <MicroStepsEditor
          steps={steps}
          onChange={(next) => {
            setSteps(next);
            clearFieldError("subTasks");
          }}
        />
        <PrioritySelector
          value={priority}
          onChange={(next) => {
            setPriority(next);
            clearFieldError("priority");
          }}
        />
        <DueDateSection
          value={dueDate}
          onChange={(next) => {
            setDueDate(next);
            clearFieldError("dueDate");
          }}
        />
        <DueTimeSection
          hour24={hour24}
          minute={minute}
          onChange={(h, m) => {
            setHour24(h);
            setMinute(m);
            clearFieldError("dueTime");
          }}
        />
        <SprintDurationSection
          value={sprintInMinutes}
          onChange={(next) => {
            setSprintInMinutes(next);
            clearFieldError("sprintInMinutes");
          }}
        />

        {/* Expected bounty */}
        <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Expected Bounty
          </span>
          {!isReady ? (
            <span className="text-xs text-amber-400">
              Add a title to preview
            </span>
          ) : isEstimating ? (
            <span className="text-xs text-amber-500">Calculating...</span>
          ) : estimate ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-amber-700">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />+{estimate.totalExp} XP
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" />
                {estimate.totalCoins}
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-400">—</span>
          )}
        </div>

        {/* Errors for fields without an inline spot (date, time, priority, ...) */}
        {otherFieldErrors.length > 0 && (
          <ul
            className="space-y-1 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600"
            role="alert"
          >
            {otherFieldErrors.map(([field, message]) => (
              <li key={field}>
                <span className="font-semibold">
                  {FIELD_LABELS[field] ?? field}:
                </span>{" "}
                {message}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-xs font-medium text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 rounded-t-3xl border-t border-gray-100 bg-white px-4 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-2 rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Quest"}
        </button>
      </div>
    </div>
  );
}

export default CreateTask;
