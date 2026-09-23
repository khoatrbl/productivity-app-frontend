// types/CreateTaskRequest.ts
import type { TaskPriority } from "./TaskPriority";

export interface CreateSubTaskRequest {
  content: string; // ASSUMPTION — confirm against your real DTO
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate: string; // "YYYY-MM-DD"
  dueTime: string; // "HH:mm:ss"
  priority: TaskPriority;
  sprintInMinutes: number;
  subTasks: CreateSubTaskRequest[];
}

export interface RewardEstimate {
  estimatedMinutes: number;
  totalExp: number;
  totalCoins: number;
  subTaskExp: number[];
}