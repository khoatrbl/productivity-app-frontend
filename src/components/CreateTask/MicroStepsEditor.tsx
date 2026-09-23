// components/CreateTask/MicroStepsEditor.tsx
import { Plus, X, GripVertical } from "lucide-react";

function MicroStepsEditor({ steps, onChange }: { steps: string[]; onChange: (s: string[]) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Micro-Steps</p>
      <div className="mt-2 space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
            <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
            <input
              value={step}
              onChange={(e) => onChange(steps.map((s, i) => (i === index ? e.target.value : s)))}
              placeholder={`Step ${index + 1}`}
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300"
            />
            <button onClick={() => onChange(steps.filter((_, i) => i !== index))} className="shrink-0 text-gray-300 hover:text-gray-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...steps, ""])} className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900">
        <Plus className="h-3.5 w-3.5" />
        Add step
      </button>
    </div>
  );
}

export default MicroStepsEditor;