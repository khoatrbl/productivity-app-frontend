// utils/taskSort.ts
import type { TaskDto } from "../types/TaskCardData";
import { TaskStatus } from "../types/TaskStatus";

const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// Primary: priority (urgent -> high). Secondary: createdAt. Used only by
// the High Priority tab, since it's the one tab mixing two priorities.
export function sortByPriorityThenCreated(tasks: TaskDto[]): TaskDto[] {
  return [...tasks].sort((a, b) => {
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// Plain chronological order — used by All, Medium, and Low, since each of
// those shows a single priority group (or none at all for "All").
export function sortByCreatedAt(tasks: TaskDto[]): TaskDto[] {
  return [...tasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Moves the in-progress task (if any) to the top; the rest keep their order.
export function activeFirst(tasks: TaskDto[]): TaskDto[] {
  const active = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  if (active.length === 0) return tasks;
  return [...active, ...tasks.filter((t) => t.status !== TaskStatus.IN_PROGRESS)];
}