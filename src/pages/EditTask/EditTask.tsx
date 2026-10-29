// pages/EditTask/EditTask.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import PrioritySelector from "../../components/CreateTask/PrioritySelector";
import DueDateSection from "../../components/CreateTask/DueDateSection";
import DueTimeSection from "../../components/CreateTask/DueTimeSection";
import SprintDurationSection from "../../components/CreateTask/SprintDurationSection";
import EditMicroStepsEditor, {
  type EditableSubTask,
} from "../../components/CreateTask/EditMicroStepsEditor";
import CharCounter from "../../components/CharCounter/CharCounter";
import { useTasks } from "../../context/TaskContext";
import { ApiError } from "../../lib/apiClient";
import type { TaskPriority } from "../../types/TaskPriority";
import { fromDateKey, toDateKey } from "../../utils/calendar";
import {
  TASK_DESCRIPTION_MAX,
  TASK_TITLE_MAX,
} from "../../constants/taskLimit";

// Friendly names for backend field errors that don't have an inline spot
const FIELD_LABELS: Record<string, string> = {
  dueDate: "Due date",
  dueTime: "Due time",
  priority: "Priority",
  sprintInMinutes: "Sprint length",
  subTasks: "Micro-steps",
};

const INLINE_FIELDS = new Set(["title", "description"]);

function EditTask() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { tasks, handleUpdate, handleDelete } = useTasks();

  const task = tasks.find((t) => t.taskId === taskId);

  // Seed all local state from the found task, once. If it's ever not found
  // (e.g. deep-linked to a stale/already-deleted task id), bail out below
  // instead of rendering a form bound to nothing.
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "MEDIUM",
  );

  // "15 minutes from now", computed once
  const [nowPlus15] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d;
  });

  // Is the saved due date/time already in the past?
  const [isOverdue] = useState(() => {
    if (!task) return false;
    const [h, m] = task.dueTime.split(":").map(Number);
    const due = fromDateKey(task.dueDate);
    due.setHours(h, m, 0, 0);
    return due < new Date();
  });

  // Overdue tasks start on a fresh, valid slot; others keep their saved schedule
  const [dueDate, setDueDate] = useState<Date>(() =>
    task && !isOverdue ? fromDateKey(task.dueDate) : nowPlus15,
  );
  const [hour24, setHour24] = useState(() =>
    task && !isOverdue
      ? Number(task.dueTime.split(":")[0])
      : nowPlus15.getHours(),
  );
  const [minute, setMinute] = useState(() =>
    task && !isOverdue
      ? Number(task.dueTime.split(":")[1])
      : nowPlus15.getMinutes(),
  );

  const [sprintInMinutes, setSprintInMinutes] = useState(
    task?.sprintInMinutes ?? 20,
  );
  const [subTasks, setSubTasks] = useState<EditableSubTask[]>(
    () =>
      task?.subTasks.map((s, i) => ({
        id: s.id,
        content: s.content,
        position: i,
        isComplete: s.isComplete ?? false,
      })) ?? [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fcf8f2] px-6 text-center">
        <p className="text-sm text-gray-500">
          This task couldn't be found — it may have already been deleted.
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  async function handleSubmit() {
    if (!task || isSubmitting) return;

    if (!title.trim()) {
      setFieldErrors({ title: "Give your quest a title first." });
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await handleUpdate(task.taskId, {
        title: title.trim(),
        description: description.trim() || "",
        dueDate: toDateKey(dueDate),
        dueTime: `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        priority,
        sprintInMinutes,
        subTasks: subTasks
          .filter((s) => s.content.trim())
          .map((s, position) => ({
            id: s.id,
            content: s.content.trim(),
            position,
            isComplete: s.isComplete,
          })),
      });
      navigate("/");
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
        setError("Couldn't save changes. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeleteTask() {
    if (!task) return;
    handleDelete(task.taskId);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Edit Task</p>
        <button
          onClick={handleDeleteTask}
          aria-label="Delete task"
          className="text-red-400 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="edit-title"
              className="text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Quest Title
            </label>
            <CharCounter length={title.length} max={TASK_TITLE_MAX} />
          </div>
          <input
            id="edit-title"
            value={title}
            maxLength={TASK_TITLE_MAX}
            onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }}
            aria-invalid={!!fieldErrors.title}
            className={`mt-1.5 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none ${
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
              htmlFor="edit-description"
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
            id="edit-description"
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

        <EditMicroStepsEditor
          steps={subTasks}
          onChange={(next) => {
            setSubTasks(next);
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

        {isOverdue && (
          <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            This quest was overdue, so we moved it to a fresh slot. Adjust it if
            you like.
          </p>
        )}

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

      <div className="flex gap-2 border-t border-gray-100 bg-white px-4 py-3">
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditTask;
