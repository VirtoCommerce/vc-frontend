type StateType = "initial" | "loading" | "ready" | "error";

export type PreviewerStateType = {
  id: string;
  priority: number;
  state: StateType;
  isActive: boolean;
  meta: {
    title: string;
  };
};

export function getVisiblePreviewer(previewers: PreviewerStateType[]) {
  if (!previewers) {
    return null;
  }
}
