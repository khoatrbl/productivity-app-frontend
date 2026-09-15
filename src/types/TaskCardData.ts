import type { TaskPriority } from "./TaskPriority";
import type { TaskStatus } from "./TaskStatus";

export interface SubTaskDto {
    id: string,
    content: string,
    exp: number,
    position: number,
    isCompleted: boolean
}

// Define explicit types to help you remember the formats
export type LocalDate = string;      // Format: "YYYY-MM-DD" (e.g., "2026-09-11")
export type LocalTime = string;      // Format: "HH:mm:ss"  (e.g., "14:30:00")
export type LocalDateTime = string; // Format: "YYYY-MM-DDTHH:mm:ss" (e.g., "2026-09-11T14:30:00")

export interface TaskDto {
    id: string,
    title: string,
    description: string,
    priority: TaskPriority,
    status: TaskStatus
    dueDate: LocalDate,
    dueTime: LocalTime,
    estimateMin: number,
    totalExp: number,
    subTasks: SubTaskDto[]
}
