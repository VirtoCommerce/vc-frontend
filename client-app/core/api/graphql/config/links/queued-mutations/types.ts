import type { ApolloLink } from "@apollo/client/core";

/**
 * Controller returned by createQueuedMutationsController. Exposes the
 * ApolloLink for wiring into the client AND a flushNow() escape hatch for
 * callers that need to drain a queued operation immediately (e.g. on input
 * blur, before navigation).
 */
export interface IQueuedMutationsController {
  link: ApolloLink;
  /**
   * Immediately drain the queue for the given operation (and optional partition
   * key). Cancels the pending debounce timer and fires the merged mutation.
   * No-ops if nothing is queued OR if a previous mutation is still in flight
   * for that queue - in the latter case the pending batch will still fire
   * after the in-flight one resolves, just on its scheduled debounce.
   */
  flushNow: (opName: string, partitionKey?: string) => void;
}

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
  /**
   * Extracts a partition key from mutation variables.
   * Mutations with different partition keys get independent queues
   * (separate timers, observers, and merged variables).
   * When omitted, all mutations share a single queue per operation name.
   */
  getPartitionKey?: (vars: TVars) => string;
}

export interface IQueueTarget<TVars extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  config?: IQueueTargetConfig<TVars>;
}

export interface IQueueConfig {
  targets: IQueueTarget<Record<string, unknown>>[];
}

export interface IObserver {
  next: (value: unknown) => void;
  complete: () => void;
  error: (reason?: unknown) => void;
}

export interface IOperationState<TVars extends Record<string, unknown>> {
  inFlight: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  mergedVariables: TVars | null;
  observers: IObserver[];
  abortController: AbortController | null;
  operation: Parameters<ApolloLink["request"]>[0] | null;
  forward: Parameters<ApolloLink["request"]>[1] | null;
}
