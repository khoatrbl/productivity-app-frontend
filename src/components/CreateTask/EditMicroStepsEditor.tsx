// components/CreateTask/EditMicroStepsEditor.tsx
import { Plus, X, GripVertical, Check } from "lucide-react";

export interface EditableSubTask {
  id: string | null; // null marks a locally-added, not-yet-saved step
  content: string;
  position: number;
  isComplete: boolean;
}

function EditMicroStepsEditor({ steps, onChange }: { steps: EditableSubTask[]; onChange: (s: EditableSubTask[]) => void }) {
  // Local-only React key, since a newly-added step has no server id yet to
  // key off — this never leaves the component, never goes in the payload.
  function keyFor(step: EditableSubTask, index: number) {
    return step.id ?? `new-${index}`;
  }

  function updateContent(index: number, content: string) {
    onChange(steps.map((s, i) => (i === index ? { ...s, content } : s)));
  }

  function toggleComplete(index: number) {
    onChange(steps.map((s, i) => (i === index ? { ...s, isComplete: !s.isComplete } : s)));
  }

  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...steps, { id: null, content: "", position: steps.length, isComplete: false }]);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Micro-Steps</p>
      <div className="mt-2 space-y-2">
        {steps.map((step, index) => (
          <div key={keyFor(step, index)} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
            <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
            <button onClick={() => toggleComplete(index)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${step.isComplete ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300"}`}>
              {step.isComplete && <Check className="h-3 w-3" />}
            </button>
            <input
              value={step.content}
              onChange={(e) => updateContent(index, e.target.value)}
              placeholder="Step content"
              className={`w-full bg-transparent text-sm outline-none placeholder:text-gray-300 ${step.isComplete ? "text-gray-400 line-through" : "text-gray-700"}`}
            />
            <button onClick={() => remove(index)} className="shrink-0 text-gray-300 hover:text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900">
        <Plus className="h-3.5 w-3.5" />
        Add step
      </button>
    </div>
  );
}

export default EditMicroStepsEditor;