// components/CreateTask/DueDateSection.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarPicker from "./CalendarPicker";

type QuickOption = "today" | "tomorrow" | "custom";

function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function DueDateSection({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [quickOption, setQuickOption] = useState<QuickOption>(() => {
    if (isSameDay(value, today)) return "today";
    if (isSameDay(value, tomorrow)) return "tomorrow";
    return "custom";
  });

  function selectQuick(option: QuickOption) {
    setQuickOption(option);
    if (option === "today") onChange(today);
    if (option === "tomorrow") onChange(tomorrow);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</p>
      <div className="mt-2 flex gap-2">
        {(["today", "tomorrow", "custom"] as QuickOption[]).map((opt) => (
          <button
            key={opt}
            onClick={() => selectQuick(opt)}
            className={`flex-1 rounded-full py-2 text-sm font-medium capitalize ${
              quickOption === opt ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {quickOption === "custom" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="mt-3">
              <CalendarPicker value={value} onChange={onChange} minDate={today} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DueDateSection;