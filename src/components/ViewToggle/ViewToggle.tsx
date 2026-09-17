import { Target, List } from "lucide-react";
import { motion } from "framer-motion";

export type DashboardView = "focus" | "list";

interface ViewToggleProps {
  value: DashboardView;
  onChange: (view: DashboardView) => void;
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex w-full items-center gap-1 rounded-full border border-orange-200 bg-orange-50 p-1">
      <motion.button
        layout
        onClick={() => onChange("focus")}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-colors ${
          value === "focus" ? "flex-1 bg-white text-gray-900 shadow-sm" : "flex-1 text-gray-500"
        }`}
      >
        <Target className="h-3.5 w-3.5" />
        Hyper-Focus
      </motion.button>

      <motion.button
        layout
        onClick={() => onChange("list")}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-colors ${
          value === "list" ? "flex-1 bg-white text-gray-900 shadow-sm" : "flex-1 text-gray-500"
        }`}
      >
        <List className="h-3.5 w-3.5" />
        List View
      </motion.button>
    </div>
  );
}

export default ViewToggle;