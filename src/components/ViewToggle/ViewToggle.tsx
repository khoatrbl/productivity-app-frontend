import { Target, List } from "lucide-react";

export type DashboardView = "focus" | "list";

interface ViewToggleProps {
  value: DashboardView;
  onChange: (view: DashboardView) => void;
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center justify-evenly rounded-full border w-full border-orange-200 bg-orange-50 p-1">
      <button
        onClick={() => onChange("focus")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "focus" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
        }`}
      >
        <Target className="h-3.5 w-3.5" />
        Hyper-Focus
      </button>

        {/* Vertical Divider */}
      <div className="w-px h-1/2 bg-gray-300"></div>

      <button
        onClick={() => onChange("list")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          value === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
        }`}
      >
        <List className="h-3.5 w-3.5" />
        List View
      </button>
    </div>
  );
}

export default ViewToggle;