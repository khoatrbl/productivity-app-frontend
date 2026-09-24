// types/UpdateTaskRequest.ts
import type { TaskPriority } from "./TaskPriority";

export interface UpdateSubTaskRequest {
  id: string | null; // null = create new; a real id = update existing
  content: string;
  position: number;
  isComplete: boolean;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:mm:ss"
  priority: TaskPriority;
  sprintInMinutes: number;
  subTasks: UpdateSubTaskRequest[];
}