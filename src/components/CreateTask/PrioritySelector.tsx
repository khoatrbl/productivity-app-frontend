// components/CreateTask/PrioritySelector.tsx
import { Flame, TriangleAlert, Minus, Sprout } from "lucide-react";
import type { TaskPriority } from "../../types/TaskPriority";

const OPTIONS: { value: TaskPriority; label: string; icon: typeof Flame; activeClass: string }[] = [
  { value: "URGENT", label: "Urgent", icon: Flame, activeClass: "bg-red-500 text-white" },
  { value: "HIGH", label: "High", icon: TriangleAlert, activeClass: "bg-orange-500 text-white" },
  { value: "MEDIUM", label: "Medium", icon: Minus, activeClass: "bg-gray-500 text-white" },
  { value: "LOW", label: "Low", icon: Sprout, activeClass: "bg-emerald-600 text-white" },
];

function PrioritySelector({ value, onChange }: { value: TaskPriority; onChange: (p: TaskPriority) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {OPTIONS.map(({ value: opt, label, icon: Icon, activeClass }) => (
          <button key={opt} onClick={() => onChange(opt)} className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-medium ${value === opt ? activeClass : "bg-gray-100 text-gray-500"}`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PrioritySelector;