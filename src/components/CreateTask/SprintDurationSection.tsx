// components/CreateTask/SprintDurationSection.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WheelPicker from "./WheelPicker";

const QUICK_OPTIONS = [5, 15, 20, 30];
const CUSTOM_MINUTES = Array.from({ length: 36 }, (_, i) => (i + 1) * 5);

function SprintDurationSection({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const [isCustom, setIsCustom] = useState(() => !QUICK_OPTIONS.includes(value));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Focus Sprint Duration</p>
      <div className="mt-2 flex gap-2">
        {QUICK_OPTIONS.map((min) => (
          <button key={min} onClick={() => { setIsCustom(false); onChange(min); }} className={`flex-1 rounded-full py-2 text-sm font-medium ${!isCustom && value === min ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-500"}`}>
            {min}m
          </button>
        ))}
        <button onClick={() => setIsCustom(true)} className={`flex-1 rounded-full py-2 text-sm font-medium ${isCustom ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-500"}`}>
          Custom
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isCustom && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="mt-3 rounded-2xl bg-gray-50 p-2">
              <WheelPicker items={CUSTOM_MINUTES} value={CUSTOM_MINUTES.includes(value) ? value : 20} onChange={onChange} renderItem={(m) => `${m} min`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SprintDurationSection;