import type { LocalDate, LocalTime } from "../types/TaskCardData";

export function formatDueDateTime(dueDate: LocalDate, dueTime: LocalTime): string {
    const [year, month, day] = dueDate.split("-").map(Number);
  const [hour, minute] = dueTime.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute);

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const timeLabel = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${timeLabel}`;

  const dateLabel = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${dateLabel}, ${timeLabel}`;
}
