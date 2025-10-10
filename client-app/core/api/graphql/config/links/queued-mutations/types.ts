type MergeQueuedFnType<TVars extends Record<string, unknown> = Record<string, unknown>> = (a: TVars, b: TVars) => TVars;

export interface IQueueTargetConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  /** Debounce in ms for this operation name */
  debounceMs?: number;
  /**
   * Called on flush to combine queued payloads into one.
   * @param a - The first variable to merge.
   * @param b - The second variable to merge.
   * @returns The merged variables.
   * @default (a, b) => { ...a, ...b } @link{defaultMergeVariables}
   */
  mergeQueued?: MergeQueuedFnType<TVars>;
}

export interface IQueueConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  targets: Array<{ name: string; config?: IQueueTargetConfig<TVars> }>;
}

export interface IPendingItem<TVars extends Record<string, unknown>> {
  variables: TVars;
  next: (value: unknown) => void;
  complete: () => void;
  error: (reason?: unknown) => void;
}

export interface IOperationState<TVars extends Record<string, unknown>> {
  inFlight: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  queue: IPendingItem<TVars>[];
  abortController: AbortController | null;
}