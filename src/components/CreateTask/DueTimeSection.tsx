// components/CreateTask/DueTimeSection.tsx — simplified, no quick-option row at all
import WheelPicker from "./WheelPicker";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];

function to12Hour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { hour12: h12, period: period as "AM" | "PM" };
}
function to24Hour(h12: number, period: "AM" | "PM") {
  if (period === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function DueTimeSection({ hour24, minute, onChange }: { hour24: number; minute: number; onChange: (h: number, m: number) => void }) {
  const { hour12, period } = to12Hour(hour24);
  const roundedMinute = (Math.round(minute / 5) * 5) % 60;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Due Time</p>
      <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gray-50 p-2">
        <WheelPicker items={HOURS_12} value={hour12} onChange={(h) => onChange(to24Hour(h, period), roundedMinute)} />
        <span className="text-lg font-semibold text-gray-400">:</span>
        <WheelPicker items={MINUTES} value={roundedMinute} onChange={(m) => onChange(to24Hour(hour12, period), m)} renderItem={(m) => m.toString().padStart(2, "0")} />
        <WheelPicker items={PERIODS} value={period} onChange={(p) => onChange(to24Hour(hour12, p), roundedMinute)} />
      </div>
    </div>
  );
}

export default DueTimeSection;