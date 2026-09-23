
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
}

function CalendarPicker({ value, onChange, minDate }: CalendarPickerProps) {
  const [viewMonth, setViewMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const today = new Date();

  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const isPast = minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
          const isSelected = isSameDay(date, value);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => onChange(date)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                isSelected ? "bg-emerald-800 font-semibold text-white"
                : isPast ? "text-gray-300"
                : isToday ? "font-semibold text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarPicker;