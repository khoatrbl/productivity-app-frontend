// hooks/useRewardEstimate.ts
import { useEffect, useState } from "react";
import { estimateReward } from "../services/taskServices";
import type { TaskPriority } from "../types/TaskPriority";
import type { RewardEstimate } from "../types/CreateTaskRequest";

const MIN_TITLE_LENGTH = 3; // matches roughly "when is this worth a network call"

export function useRewardEstimate(title: string, priority: TaskPriority, subTaskCount: number) {
  const [estimate, setEstimate] = useState<RewardEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isReady = title.trim().length >= MIN_TITLE_LENGTH && !!priority;

  useEffect(() => {
    if (!isReady) {
      setEstimate(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      estimateReward({ title: title.trim(), priority, subTaskCount })
        .then(setEstimate)
        .catch(() => setEstimate(null))
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [title, priority, subTaskCount, isReady]);

  return { estimate, isLoading, isReady };
}