import type { TaskCardData } from "../types/TaskCardData";
import { TaskPriority } from "../types/TaskPriority";
import { TaskStatus } from "../types/TaskStatus";

export const mockTaskCardData : TaskCardData[] = [
    {
        id: "task-1",
        title: "Clean the house",
        description: "Full house cleaning before guests arrive.",
        priority: TaskPriority.URGENT,
        status: TaskStatus.INCOMPLETE,
        dueDate: "2026-09-11",
        dueTime: "18:00:00",
        estimateMin: 45,
        totalExp: 50,
        subTasks: [
            {
                id: "subtask-1-1",
                title: "Clean the toilet.",
                expGain: 25,
                isCompleted: true
            },
            {
                id:"subtask-1-2",
                title: "Sweep the house.",
                expGain: 25,
                isCompleted: false
            }

        ]
    },

     {
        id: "task-2",
        title: "Clean the room",
        description: "",
        priority: TaskPriority.HIGH,
        status: TaskStatus.INCOMPLETE,
        dueDate: "2026-09-11",
        dueTime: "18:00:00",
        estimateMin: 20,
        totalExp: 50,
        subTasks: [
            {
                id: "subtask-2-1",
                title: "Make the bed.",
                expGain: 25,
                isCompleted: true
            },
            {
                id: "subtask-2-2",
                title: "Sweep the house.",
                expGain: 25,
                isCompleted: false
            }

        ]
    }
]