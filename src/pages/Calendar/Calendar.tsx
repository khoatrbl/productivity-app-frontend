// pages/Calendar/Calendar.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import CalendarTaskCard from "../../components/CalendarTaskCard/CalendarTaskCard";
import type { TaskDto } from "../../types/TaskCardData";
import {
  addMonths,
  buildMonthGrid,
  formatDayHeading,
  formatMonthTitle,
  isSameMonth,
  startOfMonth,
  toDateKey,
} from "../../utils/calendar";
import { PRIORITIES, PRIORITY_DOT, PRIORITY_LABEL, PRIORITY_ORDER } from "../../constants/priority";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function sortByPriority(tasks: TaskDto[]): TaskDto[] {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99) ||
      (a.dueTime ?? "").localeCompare(b.dueTime ?? "")
  );
}

function Calendar() {
  const navigate = useNavigate();
  const { visibleTasks, isLoading } = useTasks();

  const todayKey = toDateKey(new Date());
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState(todayKey);

  // "YYYY-MM-DD" strings compare chronologically
  const isSelectedPast = selectedKey < todayKey;

  // Group open tasks by due date, each day sorted URGENT → LOW
  const tasksByDay = useMemo(() => {
    const groups = new Map<string, TaskDto[]>();
    visibleTasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = String(task.dueDate).slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), task]);
    });
    groups.forEach((list, key) => groups.set(key, sortByPriority(list)));
    return groups;
  }, [visibleTasks]);

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const selectedTasks = tasksByDay.get(selectedKey) ?? [];
  const monthTaskCount = useMemo(
    () =>
      cells
        .filter((d) => isSameMonth(d, viewMonth))
        .reduce((sum, d) => sum + (tasksByDay.get(toDateKey(d))?.length ?? 0), 0),
    [cells, viewMonth, tasksByDay]
  );

  function goToToday() {
    setViewMonth(startOfMonth(new Date()));
    setSelectedKey(todayKey);
  }

  function selectDay(date: Date) {
    const key = toDateKey(date);
    const isPast = key < todayKey;
    const hasTasks = (tasksByDay.get(key)?.length ?? 0) > 0;
    if (isPast && !hasTasks) return; // empty past day: nothing to see or add

    setSelectedKey(key);
    if (!isSameMonth(date, viewMonth)) setViewMonth(startOfMonth(date));
  }

  function addTaskOnSelectedDay() {
    if (isSelectedPast) return; // can't schedule into the past
    navigate("/tasks/new", { state: { dueDate: selectedKey, returnTo: "/calendar" } });
  }

  const daySubtitle =
    selectedTasks.length === 0
      ? "Nothing scheduled"
      : isSelectedPast
        ? `${selectedTasks.length} overdue`
        : `${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-4 px-2">
      {/* Month card */}
      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-base font-semibold text-gray-900">{formatMonthTitle(viewMonth)}</p>
            <p className="text-xs text-gray-400">
              {monthTaskCount === 0
                ? "No open tasks"
                : `${monthTaskCount} open task${monthTaskCount === 1 ? "" : "s"}`}
            </p>
          </div>

          <button
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-gray-400">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date) => {
            const key = toDateKey(date);
            const dayTasks = tasksByDay.get(key) ?? [];
            const inMonth = isSameMonth(date, viewMonth);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const isPast = key < todayKey;
            const isDisabled = isPast && dayTasks.length === 0;
            const priorities = PRIORITIES.filter((p) => dayTasks.some((t) => t.priority === p));

            const stateClass = isSelected
              ? "bg-emerald-800 font-semibold text-white"
              : isToday
                ? "bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-300"
                : isDisabled
                  ? "cursor-not-allowed text-gray-300"
                  : isPast
                    ? "text-gray-400 hover:bg-gray-50" // past, but has overdue tasks
                    : inMonth
                      ? "text-gray-800 hover:bg-gray-50"
                      : "text-gray-300 hover:bg-gray-50";

            return (
              <button
                key={key}
                onClick={() => selectDay(date)}
                disabled={isDisabled}
                aria-label={`${date.toDateString()}, ${dayTasks.length} task${dayTasks.length === 1 ? "" : "s"}`}
                aria-pressed={isSelected}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${stateClass}`}
              >
                <span className="leading-none">{date.getDate()}</span>

                {/* One dot per priority present that day, most important first */}
                <span className="mt-1 flex h-1.5 items-center gap-0.5">
                  {priorities.map((p) => (
                    <span
                      key={p}
                      className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[p]} ${
                        isSelected ? "ring-1 ring-white/70" : ""
                      } ${!inMonth || isPast ? "opacity-40" : ""}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend + Today */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {PRIORITIES.map((p) => (
              <span key={p} className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[p]}`} />
                {PRIORITY_LABEL[p]}
              </span>
            ))}
          </div>
          {(selectedKey !== todayKey || !isSameMonth(viewMonth, new Date())) && (
            <button
              onClick={goToToday}
              className="shrink-0 rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Today
            </button>
          )}
        </div>
      </section>

      {/* Selected day */}
      <section>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-semibold text-gray-800">{formatDayHeading(selectedKey)}</h3>
            <p className={`text-xs ${isSelectedPast && selectedTasks.length > 0 ? "text-red-400" : "text-gray-400"}`}>
              {daySubtitle}
            </p>
          </div>

          {isSelectedPast ? (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
              <Clock className="h-3.5 w-3.5" /> Past day
            </span>
          ) : (
            <button
              onClick={addTaskOnSelectedDay}
              className="flex items-center gap-1 rounded-full bg-emerald-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              <Plus className="h-4 w-4" /> Add task
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-3xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-3"
            >
              {selectedTasks.map((task) => (
                  <CalendarTaskCard key={task.taskId} task={task} isOverdue={isSelectedPast} onOpen={() => navigate("/", { state: { expandTaskId: task.taskId } })}/>
              ))}

              {/* Only reachable for today/future days — empty past days can't be selected */}
              {selectedTasks.length === 0 && !isSelectedPast && (
                <button
                  onClick={addTaskOnSelectedDay}
                  className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-10 text-center hover:bg-emerald-50"
                >
                  <CalendarDays className="h-6 w-6 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800">A free day</p>
                  <p className="text-xs text-gray-400">Tap to plan something for this day</p>
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}

export default Calendar;