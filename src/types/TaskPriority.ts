
export const TaskPriority = {
    URGENT: 'URGENT',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority]