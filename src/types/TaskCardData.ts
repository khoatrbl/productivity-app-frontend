import type { TaskPriority } from "./TaskPriority";
import type { TaskStatus } from "./TaskStatus";
import type { ProfileDto } from "./UserProfile";

export interface SubTaskDto {
  id: string;
  parentId: string;
  content: string;
  exp: number;
  position: number;
  isComplete: boolean;
}

// Define explicit types to help you remember the formats
export type LocalDate = string; // Format: "YYYY-MM-DD" (e.g., "2026-09-11")
export type LocalTime = string; // Format: "HH:mm:ss"  (e.g., "14:30:00")
export type LocalDateTime = string; // Format: "YYYY-MM-DDTHH:mm:ss" (e.g., "2026-09-11T14:30:00")

export interface TaskDto {
  taskId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: LocalDate;
  dueTime: LocalTime;
  estimateMin: number;
  totalExp: number;
  totalCoins: number;
  sprintInMinutes: number;
  startExpClaimed: boolean;
  completionRewardClaimed: boolean;
  createdAt: string;
  subTasks: SubTaskDto[];

  // Filled in only on the response that completes a task
  expGranted?: number;
  coinsGranted?: number;
  bonusPetsGranted?: number;
  rewardPercent?: number; // 100 = on time
  lateMinutes?: number; // minutes past the ORIGINAL deadline
  profile?: ProfileDto | null;
}
