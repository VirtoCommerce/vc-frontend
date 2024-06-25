import type { MaybeRef } from "@vueuse/core";

export type StateType = "initial" | "loading" | "ready" | "empty";

export type PreviewerStateType = {
  id: string;
  priority: number;
  state: StateType;
  isActive: boolean;
  meta?: Record<string, MaybeRef<string | undefined>>;
};

export function getVisiblePreviewer(previewers: PreviewerStateType[]): PreviewerStateType["id"] | "loader" | null {
  const activeUnits = previewers
    .filter((el) => el.isActive && el.state !== "empty")
    .sort((a, b) => a.priority - b.priority);

  if (!activeUnits.length) {
    return null;
  }

  if (activeUnits[0].state === "ready") {
    return activeUnits[0].id;
  }

  return "loader";
}
