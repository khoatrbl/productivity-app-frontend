import { Flame, TriangleAlert, Minus, Sprout } from "lucide-react";
import type { TaskPriority } from "../../types/TaskPriority";

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: typeof Flame; className: string }> = {
  URGENT: { label: "Urgent", icon: Flame, className: "bg-red-50 text-red-600" },
  HIGH: { label: "High", icon: TriangleAlert, className: "bg-orange-50 text-orange-600" },
  MEDIUM: { label: "Medium", icon: Minus, className: "bg-gray-100 text-gray-500" },
  LOW: { label: "Low", icon: Sprout, className: "bg-emerald-50 text-emerald-600" },
};

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null; // unknown value — fail quietly rather than crash

  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default PriorityBadge;