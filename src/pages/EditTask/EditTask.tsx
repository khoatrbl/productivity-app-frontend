// pages/EditTask/EditTask.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import PrioritySelector from "../../components/CreateTask/PrioritySelector";
import DueDateSection from "../../components/CreateTask/DueDateSection";
import DueTimeSection from "../../components/CreateTask/DueTimeSection";
import SprintDurationSection from "../../components/CreateTask/SprintDurationSection";
import EditMicroStepsEditor, { type EditableSubTask } from "../../components/CreateTask/EditMicroStepsEditor";
import { useTasks } from "../../context/TaskContext";
import type { TaskPriority } from "../../types/TaskPriority";

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(() => (task ? new Date(`${task.dueDate}T00:00:00`) : new Date()));
  const [hour24, setHour24] = useState(() => (task ? Number(task.dueTime.split(":")[0]) : 18));
  const [minute, setMinute] = useState(() => (task ? Number(task.dueTime.split(":")[1]) : 0));
  const [sprintInMinutes, setSprintInMinutes] = useState(task?.sprintInMinutes ?? 20);
  const [subTasks, setSubTasks] = useState<EditableSubTask[]>(
    () => task?.subTasks.map((s, i) => ({ id: s.id, content: s.content, position: i, isComplete: s.isCompleted })) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fcf8f2] px-6 text-center">
        <p className="text-sm text-gray-500">This task couldn't be found — it may have already been deleted.</p>
        <button onClick={() => navigate("/")} className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Give your quest a title first.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    if (!task) {
        return;
    }

    const updated = await handleUpdate(task.taskId, {
      title: title.trim(),
      description: description.trim() || "",
      dueDate: formatLocalDate(dueDate),
      dueTime: `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      priority,
      sprintInMinutes,
      // handleSubmit — only the subTasks mapping changes
      subTasks: subTasks
        .filter((s) => s.content.trim())
        .map((s, position) => ({ id: s.id, content: s.content.trim(), position, isComplete: s.isComplete })),
    });

    setIsSubmitting(false);
    if (updated) {
      navigate("/");
    } else {
      setError("Couldn't save changes — try again.");
    }
  }

  function handleDeleteTask() {
    if (!task) {
        return;
    }

    handleDelete(task.taskId);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-gray-900">Edit Task</p>
        <button onClick={handleDeleteTask} className="text-red-400 hover:text-red-600">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quest Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base text-gray-800 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
          />
        </div>

        <EditMicroStepsEditor steps={subTasks} onChange={setSubTasks} />
        <PrioritySelector value={priority} onChange={setPriority} />
        <DueDateSection value={dueDate} onChange={setDueDate} />
        <DueTimeSection hour24={hour24} minute={minute} onChange={(h, m) => { setHour24(h); setMinute(m); }} />
        <SprintDurationSection value={sprintInMinutes} onChange={setSprintInMinutes} />

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2 border-t border-gray-100 bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-600">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex-2 rounded-full bg-emerald-800 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditTask;