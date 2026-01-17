import type { Urgency } from "@/types/mission.types";

export const urgencyColors: Record<Urgency, string> = {
  HIGH: "badge-destructive",
  MEDIUM: "badge-warning",
  LOW: "badge-success",
};
