import { ApolloLink, Observable } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { useQueuedMutations } from "@/core/composables/useQueuedMutations";
import { isMutation, defaultMergeVariables } from "./utils";
import type { UpdateShortCartItemQuantityMutationVariables } from "@/core/api/graphql/types";
import type { DefaultContext } from "@apollo/client/core";

type MergeQueuedFnType<TVars extends Record<string, unknown> = Record<string, unknown>> = (a: TVars, b: TVars) => TVars;

interface IQueueTargetConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  /** Debounce in ms for this operation name */
  debounceMs?: number;
  /**
   * Called on flush to combine queued payloads into one.
   * @param a - The first variable to merge.
   * @param b - The second variable to merge.
   * @returns The merged variables.
   */
  mergeQueued?: MergeQueuedFnType<TVars>;
}

interface IQueueConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
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
  timer: ReturnType<typeof setTimeout> | null;
  queue: IPendingItem<TVars>[];
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
  const { setQueuedTotal } = useQueuedMutations();

  function getState(opName: string): IOperationState<TVars> {
    let state = stateByOperation.get(opName);
    if (!state) {
      state = { inFlight: false, timer: null, queue: [], abortController: null };
      stateByOperation.set(opName, state);
    }
    return state;
  }

  function computeTotalQueued(): number {
    return Array.from(stateByOperation.values()).reduce((acc, s) => acc + s.queue.length, 0);
  }

  function updateQueuedTotal(): void {
    setQueuedTotal(computeTotalQueued());
  }

  function getResolvedConfig(opName: string) {
    return resolvedConfigMap.get(opName)!;
  }

  function scheduleNextFlush(opName: string): void {
    const state = getState(opName);
    if (state.queue.length === 0) {
      return;
    }
    if (state.timer) {
      clearTimeout(state.timer);
    }
    const { debounceMs } = getResolvedConfig(opName);
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
  ): void {
    const state = getState(opName);
    state.queue.push({ variables, next, complete, error });
    updateQueuedTotal();
    scheduleNextFlush(opName);
  }

  function mergeQueuedVariables(opName: string, items: IPendingItem<TVars>[]): TVars {
    const { mergeQueued } = getResolvedConfig(opName);
    return items.reduce<TVars>(
      (acc, cur, idx) => (idx === 0 ? cur.variables : mergeQueued(acc, cur.variables)),
      {} as TVars,
    );
  }

  async function flush(opName: string): Promise<void> {
    const state = getState(opName);
    if (state.inFlight || state.queue.length === 0) {
      return;
    }
    const items = state.queue.slice();
    const mergedVariables = mergeQueuedVariables(opName, items);
    state.queue = [];
    updateQueuedTotal();
    state.inFlight = true;
    state.abortController = new AbortController();

    // Signal execution to the link request cycle
    pendingExecuteBundles.set(opName, { variables: mergedVariables, items });
  }

  // This map allows us to connect the scheduled flush with the actual Apollo forward call cycle.
  const pendingExecuteBundles = new Map<string, { variables: TVars; items: IPendingItem<TVars>[] }>();

  function executeBundle(
    opName: string,
    operation: Parameters<ApolloLink["request"]>[0],
    forward: NonNullable<Parameters<ApolloLink["request"]>[1]>,
    bundle: { variables: TVars; items: IPendingItem<TVars>[] },
  ): () => void {
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
        scheduleNextFlush(opName);
      },
      error: (err) => {
        stateNow.inFlight = false;
        stateNow.abortController = null;
        for (const i of items) {
          i.error(err);
        }
      },
    });

    return () => {
      sub.unsubscribe();
      if (stateNow.timer) {
        clearTimeout(stateNow.timer);
        stateNow.timer = null;
      }
      if (stateNow.inFlight) {
        stateNow.abortController?.abort(AbortReason.Explicit);
      }
    };
  }

  function startBundlePolling(
    opName: string,
    operation: Parameters<ApolloLink["request"]>[0],
    forward: Parameters<ApolloLink["request"]>[1],
  ): () => void {
    let teardown: (() => void) | null = null;
    const interval = setInterval(() => {
      const bundle = pendingExecuteBundles.get(opName);
      const currentState = getState(opName);
      if (!bundle || currentState.inFlight !== true) {
        return;
      }
      pendingExecuteBundles.delete(opName);
      clearInterval(interval);
      if (!forward) {
        // No next link to forward to – fail fast and notify observers
        currentState.inFlight = false;
        currentState.abortController = null;
        for (const i of bundle.items) {
          i.error(new Error("No next link available to execute the queued mutation"));
        }
        return;
      }
      teardown = executeBundle(opName, operation, forward, bundle);
    }, 10);

    return () => {
      clearInterval(interval);
      if (teardown) {
        teardown();
        teardown = null;
      }
    };
  }

  return new ApolloLink((operation, forward) => {
    if (!isMutation(operation) || !targets.has(operation.operationName)) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const opName = operation.operationName;

      const next = (value: unknown) => observer.next(value as never);
      const complete = () => observer.complete();
      const error = (reason?: unknown) => observer.error(reason);

      enqueue(opName, operation.variables as TVars, next, complete, error);

      // Poll for execution signal; minimal coupling to Apollo internal scheduling.
      const stop = startBundlePolling(opName, operation, forward);

      // teardown if observer unsubscribes before interval fires or after execution
      return () => {
        stop();
      };
    });
  });
}

const updateShortCartItemQuantityConfig: IQueueTargetConfig<UpdateShortCartItemQuantityMutationVariables> = {
  debounceMs: 1000,
  mergeQueued: (a, b) => {
    const prevItems = a.command?.items ?? [];
    const newItems = b.command?.items ?? [];
    const nonOverlappingPrevItems = prevItems.filter(
      (item) => !newItems.some((newItem) => newItem?.productId === item?.productId),
    );
    return {
      ...a,
      command: { ...a.command, items: [...nonOverlappingPrevItems, ...newItems] },
    };
  },
};

export const queuedMutationsLink = createQueuedMutationsLink({
  targets: [
    {
      name: "UpdateShortCartItemQuantity",
      config: updateShortCartItemQuantityConfig,
    },
  ],
});
