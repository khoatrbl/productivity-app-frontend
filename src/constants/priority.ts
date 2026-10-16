export const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const PRIORITY_DOT: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-400",
  MEDIUM: "bg-amber-300",
  LOW: "bg-emerald-400",
};

export const PRIORITY_LABEL: Record<string, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;