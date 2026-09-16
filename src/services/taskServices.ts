
import apiClient, { toApiError } from "../lib/apiClient";
import type { TaskDto } from "../types/TaskCardData";
import type { TaskStatus } from "../types/TaskStatus";


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