// components/CreateTask/EditMicroStepsEditor.tsx
import { useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, X, GripVertical, Check } from "lucide-react";
import CharCounter from "../CharCounter/CharCounter";
import { SUBTASK_MAX } from "../../constants/taskLimit";

export interface EditableSubTask {
  id: string | null; // null marks a locally-added, not-yet-saved step
  content: string;
  position: number;
  isComplete: boolean; // read-only here: steps are ticked only while the task is in progress
}

interface EditMicroStepsEditorProps {
  steps: EditableSubTask[];
  onChange: (steps: EditableSubTask[]) => void;
}

const withPositions = (list: EditableSubTask[]) =>
  list.map((s, i) => ({ ...s, position: i }));

function StepRow({
  rowKey,
  step,
  onEdit,
  onRemove,
}: {
  rowKey: string;
  step: EditableSubTask;
  onEdit: (content: string) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={rowKey}
      dragListener={false} // only the handle starts a drag, so typing/scrolling stays normal
      dragControls={dragControls}
      className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2"
      whileDrag={{ scale: 1.02, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(e) => dragControls.start(e)}
        className="flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-gray-300 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Status indicator only — not clickable */}
      <span
        aria-label={step.isComplete ? "Done" : "Not done"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          step.isComplete
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-gray-300"
        }`}
      >
        {step.isComplete && <Check className="h-3 w-3" />}
      </span>

      <div className="relative min-w-0 flex-1">
        <input
          value={step.content}
          maxLength={SUBTASK_MAX}
          onChange={(e) => onEdit(e.target.value)}
          placeholder="Step content"
          className={`w-full bg-transparent pr-12 text-sm outline-none placeholder:text-gray-300 ${
            step.isComplete ? "text-gray-400 line-through" : "text-gray-700"
          }`}
        />
        {step.content.length > 0 && (
          <CharCounter
            length={step.content.length}
            max={SUBTASK_MAX}
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
          />
        )}
      </div>

      <button
        type="button"
        aria-label="Remove step"
        onClick={onRemove}
        className="shrink-0 text-gray-300 hover:text-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </Reorder.Item>
  );
}

function EditMicroStepsEditor({ steps, onChange }: EditMicroStepsEditorProps) {
  // Local-only row keys, kept in step order. Saved steps reuse their server id;
  // new steps (id === null) get a random one. Never leaves the component.
  const keysRef = useRef<string[]>([]);
  while (keysRef.current.length < steps.length) {
    const step = steps[keysRef.current.length];
    keysRef.current.push(step.id ?? crypto.randomUUID());
  }
  if (keysRef.current.length > steps.length)
    keysRef.current = keysRef.current.slice(0, steps.length);
  const keys = keysRef.current;

  function edit(index: number, content: string) {
    onChange(steps.map((s, i) => (i === index ? { ...s, content } : s)));
  }

  function remove(index: number) {
    keysRef.current = keys.filter((_, i) => i !== index);
    onChange(withPositions(steps.filter((_, i) => i !== index)));
  }

  function reorder(nextKeys: string[]) {
    const nextSteps = nextKeys.map((k) => steps[keys.indexOf(k)]);
    keysRef.current = nextKeys;
    onChange(withPositions(nextSteps));
  }

  function add() {
    keysRef.current = [...keys, crypto.randomUUID()];
    onChange([
      ...steps,
      { id: null, content: "", position: steps.length, isComplete: false },
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Micro-Steps
        </p>
        {steps.length > 1 && (
          <p className="text-[11px] text-gray-400">Drag ⋮⋮ to reorder</p>
        )}
      </div>

      <Reorder.Group
        axis="y"
        values={keys}
        onReorder={reorder}
        className="mt-2 space-y-2"
      >
        {steps.map((step, index) => (
          <StepRow
            key={keys[index]}
            rowKey={keys[index]}
            step={step}
            onEdit={(content) => edit(index, content)}
            onRemove={() => remove(index)}
          />
        ))}
      </Reorder.Group>

      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
      >
        <Plus className="h-3.5 w-3.5" />
        Add step
      </button>
    </div>
  );
}

export default EditMicroStepsEditor;
