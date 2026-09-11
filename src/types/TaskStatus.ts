
export const TaskStatus = {
    COMPLETE: 'COMPLETE',
    INCOMPLETE: 'INCOMPLETE',
    IN_PROGRESS: 'IN_PROGRESS'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];