// components/CreateTask/MicroStepsEditor.tsx
import { useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Plus, X, GripVertical } from "lucide-react";
import CharCounter from "../CharCounter/CharCounter";
import { SUBTASK_MAX } from "../../constants/taskLimit";

interface MicroStepsEditorProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

function StepRow({
  id,
  index,
  value,
  onEdit,
  onRemove,
}: {
  id: string;
  index: number;
  value: string;
  onEdit: (text: string) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={id}
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

      <div className="relative min-w-0 flex-1">
        <input
          value={value}
          maxLength={SUBTASK_MAX}
          onChange={(e) => onEdit(e.target.value)}
          placeholder={`Step ${index + 1}`}
          className="w-full bg-transparent pr-12 text-sm text-gray-700 outline-none placeholder:text-gray-300"
        />
        {value.length > 0 && (
          <CharCounter
            length={value.length}
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

function MicroStepsEditor({ steps, onChange }: MicroStepsEditorProps) {
  // Steps are plain strings, so two can be identical (e.g. two empty ones).
  // Reorder needs a unique value per row, so keep a stable id per row, in step order.
  const idsRef = useRef<string[]>([]);
  while (idsRef.current.length < steps.length)
    idsRef.current.push(crypto.randomUUID());
  if (idsRef.current.length > steps.length)
    idsRef.current = idsRef.current.slice(0, steps.length);
  const ids = idsRef.current;

  function edit(index: number, text: string) {
    onChange(steps.map((s, i) => (i === index ? text : s)));
  }

  function remove(index: number) {
    idsRef.current = ids.filter((_, i) => i !== index);
    onChange(steps.filter((_, i) => i !== index));
  }

  function reorder(nextIds: string[]) {
    const nextSteps = nextIds.map((id) => steps[ids.indexOf(id)]);
    idsRef.current = nextIds;
    onChange(nextSteps);
  }

  function add() {
    idsRef.current = [...ids, crypto.randomUUID()];
    onChange([...steps, ""]);
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
        values={ids}
        onReorder={reorder}
        className="mt-2 space-y-2"
      >
        {steps.map((step, index) => (
          <StepRow
            key={ids[index]}
            id={ids[index]}
            index={index}
            value={step}
            onEdit={(text) => edit(index, text)}
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

export default MicroStepsEditor;
