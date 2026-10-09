export type StateType = "initial" | "loading" | "ready" | "empty" | "redirect";

export type UpdateStateEventArgs = {
  state: StateType;
  redirectUrl?: string;
};

export type PreviewerStateType = {
  id: string;
  priority: number;
  state: StateType;
  isActive: boolean;
  redirectUrl?: string;
};

export function getVisiblePreviewer(previewers: PreviewerStateType[]): PreviewerStateType | "loader" | null {
  const activeUnits = previewers
    .filter((el) => el.isActive && el.state !== "empty")
    .sort((a, b) => a.priority - b.priority);

  if (!activeUnits.length) {
    return null;
  }

  const redirectUnit = activeUnits.find((el) => el.state === "redirect");
  const nonEmptyUnits = activeUnits.filter((el) => el.state !== "redirect");

  if (!nonEmptyUnits.length && redirectUnit) {
    return redirectUnit;
  }

  if (nonEmptyUnits?.[0].state === "ready") {
    return nonEmptyUnits[0];
  }

  return "loader";
}
