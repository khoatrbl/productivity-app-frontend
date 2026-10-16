/** Local date → "YYYY-MM-DD" (no UTC conversion). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Monday-first grid covering the whole month (5 or 6 rows). */
export function buildMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from(
    { length: cellCount },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i)
  );
}

export function formatMonthTitle(month: Date): string {
  return month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatDayHeading(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}