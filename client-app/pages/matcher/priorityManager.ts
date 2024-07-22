export type StateType = "initial" | "loading" | "ready" | "empty";

export type PreviewerStateType = {
  id: string;
  priority: number;
  state: StateType;
  isActive: boolean;
};

export function getVisiblePreviewer(previewers: PreviewerStateType[]): PreviewerStateType["id"] | "loader" | null {
  function is404(previewer: PreviewerStateType): boolean {
    return previewer.id === "internal" && previewer.state === "empty";
  }

  const activeUnits = previewers
    .filter((el) => el.isActive && (el.state !== "empty" || is404(el)))
    .sort((a, b) => a.priority - b.priority);

  if (!activeUnits.length || is404(activeUnits[0])) {
    return null;
  }

  if (activeUnits[0].state === "ready") {
    return activeUnits[0].id;
  }

  return "loader";
}
