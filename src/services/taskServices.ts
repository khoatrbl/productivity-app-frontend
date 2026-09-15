
import apiClient, { toApiError } from "../lib/apiClient";
import type { TaskDto } from "../types/TaskCardData";


export async function getTasks(): Promise<TaskDto[]> {
    try {
        const {data} = await apiClient.get<TaskDto[]>("/tasks")

        return data;
    } catch (err) {
        throw toApiError(err)
    }
}