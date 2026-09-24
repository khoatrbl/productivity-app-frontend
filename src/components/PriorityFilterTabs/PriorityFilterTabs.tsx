// components/PriorityFilterTabs/PriorityFilterTabs.tsx
import { Sparkles, Zap, Coffee, Sprout } from "lucide-react";
import type { TaskDto } from "../../types/TaskCardData";

export type PriorityFilter = "ALL" | "HIGH_URGENT" | "MEDIUM" | "LOW";

interface TabConfig {
  key: PriorityFilter;
  label: string;
  icon: typeof Zap;
  match: (priority: string) => boolean;
}

const TAB_CONFIG: TabConfig[] = [
  { key: "ALL", label: "All", icon: Sparkles, match: () => true },
  { key: "HIGH_URGENT", label: "High Priority", icon: Zap, match: (p) => p === "URGENT" || p === "HIGH" },
  { key: "MEDIUM", label: "Easy Flow", icon: Coffee, match: (p) => p === "MEDIUM" },
  { key: "LOW", label: "Chill", icon: Sprout, match: (p) => p === "LOW" },
];

interface PriorityFilterTabsProps {
  tasks: TaskDto[]; // unfiltered visible tasks — used only to compute counts
  value: PriorityFilter;
  onChange: (filter: PriorityFilter) => void;
}

function PriorityFilterTabs({ tasks, value, onChange }: PriorityFilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TAB_CONFIG.map(({ key, label, icon: Icon, match }) => {
        const count = tasks.filter((t) => match(t.priority)).length;
        const isActive = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? "border-emerald-800 bg-emerald-800 text-white" : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={`rounded-full px-1.5 text-[10px] font-semibold ${isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PriorityFilterTabs;