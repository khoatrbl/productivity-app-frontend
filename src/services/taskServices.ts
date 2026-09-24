
import apiClient, { toApiError } from "../lib/apiClient";
import type { CreateTaskRequest, RewardEstimate } from "../types/CreateTaskRequest";
import type { ProfileDto } from "../types/SanctuaryProfile";
import type { TaskDto } from "../types/TaskCardData";
import type { TaskPriority } from "../types/TaskPriority";
import type { TaskStatus } from "../types/TaskStatus";
import type { UpdateTaskRequest } from "../types/UpdateTaskRequest";

export interface StartExpClaimResult {
  claimed: boolean,
  expGranted: number,
  profile: ProfileDto,
}


export async function getTasks(): Promise<TaskDto[]> {
    try {
        const {data} = await apiClient.get<TaskDto[]>("/tasks")
        console.log("updateTaskStatus response:", data); // TEMP
        return data;
    } catch (err) {
        throw toApiError(err)
    }
}

export async function updateTaskStatus(taskId: string, taskStatus: TaskStatus):Promise<TaskDto> {
    try {
        const {data} = await apiClient.patch<TaskDto>(`/tasks/${taskId}`, {taskStatus: taskStatus});

        return data;
    } catch (err) {
        throw toApiError(err);
    }

}

export async function createTask(payload: CreateTaskRequest): Promise<TaskDto> {
  try {
    const { data } = await apiClient.post<TaskDto>("/tasks", payload);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function estimateReward(params: {
  title: string;
  priority: TaskPriority;
  subTaskCount: number;
}): Promise<RewardEstimate> {
  try {
    const { data } = await apiClient.post<RewardEstimate>("/tasks/reward-estimate", params);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function claimStartExpReward(taskId: string) : Promise<StartExpClaimResult> {
  try {
    const {data} = await apiClient.post<StartExpClaimResult>(`/tasks/${taskId}/claims`);

    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateTask(taskId: string, payload: UpdateTaskRequest): Promise<TaskDto> {
  try {
    const { data } = await apiClient.put<TaskDto>(`/tasks/${taskId}`, payload);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteTask(taskId: string) : Promise<void> {
  try {
    const {data} = await apiClient.delete(`/tasks/${taskId}`);

    return data;
  } catch (err) {
    throw toApiError(err);
  }
}