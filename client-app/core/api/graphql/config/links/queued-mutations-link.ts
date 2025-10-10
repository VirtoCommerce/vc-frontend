/* eslint-disable sonarjs/no-nested-functions */
import { ApolloLink, Observable } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { isMutation, defaultMergeVariables } from "./utils";
import type { DefaultContext } from "@apollo/client/core";

type MergeQueuedFnType<TVars extends Record<string, unknown> = Record<string, unknown>> = (a: TVars, b: TVars) => TVars;

export interface IQueueTargetConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  // Debounce in ms for this operation name
  debounceMs?: number;
  /**
   * Called on flush to combine queued payloads into one.
   * @param a - The first variable to merge.
   * @param b - The second variable to merge.
   * @returns The merged variables.
   */
  mergeQueued?: MergeQueuedFnType<TVars>;
}

export interface IQueueConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  // Operation names to manage. If empty, nothing is intercepted.
  // Per-target overrides only.
  targets: Array<{ name: string; config?: IQueueTargetConfig<TVars> }>;
}

interface IPendingItem<TVars extends Record<string, unknown>> {
  variables: TVars;
  next: (value: unknown) => void;
  complete: () => void;
  error: (reason?: unknown) => void;
}

interface IOperationState<TVars extends Record<string, unknown>> {
  inFlight: boolean;
  // debounce timer id
  timer: ReturnType<typeof setTimeout> | null;
  // queued items to merge and send as one
  queue: IPendingItem<TVars>[];
  // abort controller per in-flight network call
  abortController: AbortController | null;
}

export function createQueuedMutationsLink<TVars extends Record<string, unknown> = Record<string, unknown>>(
  config: IQueueConfig<TVars>,
): ApolloLink {
  const targetConfigMap = new Map<string, IQueueTargetConfig<TVars>>();
  for (const t of config.targets) {
    targetConfigMap.set(t.name, t.config ?? {});
  }

  const targets = new Set<string>(Array.from(targetConfigMap.keys()));

  // Pre-resolve per-target configs once (no common/global config layer exists)
  const resolvedConfigMap = new Map<
    string,
    Required<Pick<IQueueTargetConfig<TVars>, "debounceMs">> & {
      mergeQueued: MergeQueuedFnType<TVars>;
    }
  >();
  for (const [name, cfg] of targetConfigMap.entries()) {
    const resolvedReduce: MergeQueuedFnType<TVars> =
      (cfg.mergeQueued as MergeQueuedFnType<TVars>) ?? ((a, b) => defaultMergeVariables(a, b));
    resolvedConfigMap.set(name, {
      debounceMs: cfg.debounceMs ?? 300,
      mergeQueued: resolvedReduce,
    });
  }

  const stateByOperation = new Map<string, IOperationState<TVars>>();

  function getState(opName: string): IOperationState<TVars> {
    let state = stateByOperation.get(opName);
    if (!state) {
      state = { inFlight: false, timer: null, queue: [], abortController: null };
      stateByOperation.set(opName, state);
    }
    return state;
  }

  function reschedule(opName: string) {
    const state = getState(opName);
    if (state.queue.length === 0) {
      return;
    }
    if (state.timer) {
      clearTimeout(state.timer);
    }
    const { debounceMs } = resolvedConfigMap.get(opName)!;
    state.timer = setTimeout(() => {
      void flush(opName).catch(() => undefined);
    }, debounceMs);
  }

  function enqueue(
    opName: string,
    variables: TVars,
    next: (v: unknown) => void,
    complete: () => void,
    error: (r?: unknown) => void,
  ) {
    const state = getState(opName);
    const { debounceMs } = resolvedConfigMap.get(opName)!;
    state.queue.push({ variables, next, complete, error });

    // debounce scheduling
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.timer = setTimeout(() => {
      void flush(opName).catch(() => {
        /* errors are delivered via observer */
      });
    }, debounceMs);
  }

  async function flush(opName: string) {
    const state = getState(opName);
    if (state.inFlight || state.queue.length === 0) {
      return;
    }
    const items = state.queue.slice();
    // merge all queued variables into a single payload for one mutation call
    const { mergeQueued } = resolvedConfigMap.get(opName)!;
    const mergedVariables = items.reduce<TVars>(
      (acc, cur, idx) => (idx === 0 ? cur.variables : mergeQueued(acc, cur.variables)),
      {} as TVars,
    );
    state.queue = [];
    state.inFlight = true;
    state.abortController = new AbortController();

    // Execution is per operation through returned ApolloLink request implementation
    // We will fan-out results to all queued observers
    pendingExecuteBundles.set(opName, { variables: mergedVariables, items });
  }

  // This map allows us to connect the scheduled flush with the actual Apollo forward call cycle.
  const pendingExecuteBundles = new Map<string, { variables: TVars; items: IPendingItem<TVars>[] }>();

  return new ApolloLink((operation, forward) => {
    if (!isMutation(operation) || !targets.has(operation.operationName)) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const opName = operation.operationName;

      const next = (value: unknown) => {
        observer.next(value as never);
      };
      const complete = () => observer.complete();
      const error = (reason?: unknown) => observer.error(reason);

      enqueue(opName, operation.variables as TVars, next, complete, error);

      // Poll for execution signal; minimal coupling to Apollo internal scheduling.
      let teardown: (() => void) | null = null;
      const interval = setInterval(() => {
        const bundle = pendingExecuteBundles.get(opName);
        const currentState = getState(opName);
        if (!bundle || currentState.inFlight !== true) {
          return;
        }
        // consume and execute once
        pendingExecuteBundles.delete(opName);
        clearInterval(interval);

        // prepare and forward
        const { variables: mergedVariables, items } = bundle;
        const stateNow = getState(opName);
        operation.setContext((prev: DefaultContext & { fetchOptions?: RequestInit }) => ({
          ...prev,
          fetchOptions: { ...(prev?.fetchOptions ?? {}), signal: stateNow.abortController?.signal },
        }));
        operation.variables = mergedVariables;

        const sub = forward(operation).subscribe({
          next: (result) => {
            stateNow.inFlight = false;
            stateNow.abortController = null;
            for (const i of items) {
              i.next(result);
              i.complete();
            }
            reschedule(opName);
          },
          error: (err) => {
            stateNow.inFlight = false;
            stateNow.abortController = null;
            for (const i of items) {
              i.error(err);
            }
          },
        });

        teardown = () => {
          sub.unsubscribe();
          if (stateNow.timer) {
            clearTimeout(stateNow.timer);
            stateNow.timer = null;
          }
          if (stateNow.inFlight) {
            stateNow.abortController?.abort(AbortReason.Explicit);
          }
        };
      }, 10);

      // teardown if observer unsubscribes before interval fires
      return () => {
        clearInterval(interval);
        if (teardown) {
          teardown();
          teardown = null;
        }
      };
    });
  });
}

export const queuedMutationsLink = createQueuedMutationsLink({
  targets: [
    {
      name: "UpdateShortCartItemQuantity",
      config: {
        debounceMs: 2000,
        mergeQueued: (a, b) => {
          const prevItems = a.command?.items ?? [];
          const newItems = b.command?.items ?? [];
          const nonOverlappingPrevItems = prevItems.filter(
            (item) => !newItems.some((newItem) => newItem.productId === item.productId),
          );

          return { ...a, command: { ...a.command, items: [...nonOverlappingPrevItems, ...newItems] } };
        },
      },
    },
  ],
});
