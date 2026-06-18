import { ApolloLink, Observable } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { useQueuedMutations } from "@/core/composables/useQueuedMutations";
import { isMutation, defaultMergeVariables } from "../utils";
import type {
  IQueueConfig,
  IQueueTargetConfig,
  IQueueTarget,
  IOperationState,
  IObserver,
  IQueuedMutationsController,
} from "./types";
import type { UpdateShortCartItemQuantityMutationVariables } from "@/core/api/graphql/types";
import type { DefaultContext } from "@apollo/client/core";

export const DEFAULT_DEBOUNCE_MS = 1000;

/**
 * Creates a queued mutations controller exposing the ApolloLink and a
 * flushNow escape hatch.
 * @description Imagine user adds 5 items of product A to cart, then adds 3 items of product B to cart, then changes quantity of product A to 2. The link will merge the variables and send only one network request to the server.
 * Further actions happening while network request is in flight + debounce time are queued and will be merged with the next network request.
 *
 * Targets may optionally declare a `getPartitionKey` (see {@link IQueueTargetConfig}).
 * Mutations with the same operation name but different partition keys get fully
 * independent queues (separate timers, observers, and merged variables). When
 * omitted, all mutations of an operation share a single queue, preserving the
 * original behavior.
 * @param config @link{IQueueConfig} - The configuration for the queued mutations link.
 */
export function createQueuedMutationsController(config: IQueueConfig): IQueuedMutationsController {
  type TVarsType = Record<string, unknown>;
  const targets = new Set<string>(Array.from(config.targets.map((t) => t.name)));

  const targetConfigMap = new Map<
    string,
    Required<Omit<IQueueTargetConfig<TVarsType>, "getPartitionKey">> &
      Pick<IQueueTargetConfig<TVarsType>, "getPartitionKey">
  >(
    config.targets.map((target) => [
      target.name,
      {
        debounceMs: target.config?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
        mergeQueued: target.config?.mergeQueued ?? ((a, b) => defaultMergeVariables(a, b)),
        getPartitionKey: target.config?.getPartitionKey,
      },
    ]),
  );

  // State is keyed by "opName" or, when the target declares getPartitionKey, by
  // "opName:partition" so each partition keeps an independent queue.
  const stateByOperation = new Map<string, IOperationState<TVarsType>>();

  function getStateKey(opName: string, variables: TVarsType): string {
    const cfg = targetConfigMap.get(opName);
    if (cfg?.getPartitionKey) {
      return `${opName}:${cfg.getPartitionKey(variables)}`;
    }
    return opName;
  }

  const { setQueuedTotal } = useQueuedMutations();

  function getState(opName: string): IOperationState<TVarsType> {
    const state = stateByOperation.get(opName);

    if (state) {
      return state;
    }

    const newState: IOperationState<TVarsType> = {
      inFlight: false,
      timer: null,
      mergedVariables: null,
      observers: [],
      abortController: null,
      operation: null,
      forward: null,
    };
    stateByOperation.set(opName, newState);

    return newState;
  }

  function computeTotalQueued(): number {
    return Array.from(stateByOperation.values()).reduce((acc, s) => acc + s.observers.length, 0);
  }

  function updateQueuedTotal(): void {
    setQueuedTotal(computeTotalQueued());
  }

  function getTargetConfig(stateKey: string) {
    // State key may be "opName:partition" or just "opName"
    // eslint-disable-next-line sonarjs/null-dereference -- stateKey is a typed string parameter; the rule is a false positive here
    const opName = stateKey.split(":")[0];
    const _config = targetConfigMap.get(opName);

    if (!_config) {
      throw new Error(`Target config not found for operation ${opName}`);
    }

    return _config;
  }

  function scheduleNextFlush(opName: string): void {
    const state = getState(opName);

    if (state.observers.length === 0) {
      return;
    }

    if (state.timer) {
      clearTimeout(state.timer);
    }

    const { debounceMs } = getTargetConfig(opName);

    state.timer = setTimeout(() => {
      flush(opName);
    }, debounceMs);
  }

  function enqueue(opName: string, variables: TVarsType, observer: IObserver): void {
    const state = getState(opName);
    const { mergeQueued } = getTargetConfig(opName);

    state.observers.push(observer);

    state.mergedVariables = state.mergedVariables ? mergeQueued(state.mergedVariables, variables) : variables;

    updateQueuedTotal();
    scheduleNextFlush(opName);
  }

  function flush(opName: string): void {
    const state = getState(opName);

    if (state.inFlight || state.observers.length === 0 || !state.mergedVariables) {
      return;
    }

    if (!state.operation || !state.forward) {
      return;
    }

    const observers = state.observers.slice();
    const mergedVariables = state.mergedVariables;

    // Clear state for next batch
    state.observers = [];
    state.mergedVariables = null;
    state.inFlight = true;
    state.abortController = new AbortController();

    updateQueuedTotal();

    // Set up the operation with merged variables and abort signal
    state.operation.setContext((prev: DefaultContext & { fetchOptions?: RequestInit }) => ({
      ...prev,
      fetchOptions: { ...prev?.fetchOptions, signal: state.abortController?.signal },
    }));
    state.operation.variables = mergedVariables;

    // Execute the merged mutation
    state.forward(state.operation).subscribe({
      next: (result) => {
        state.inFlight = false;
        state.abortController = null;

        for (const observer of observers) {
          observer.next(result);
          observer.complete();
        }
        scheduleNextFlush(opName);
      },
      error: (err) => {
        state.inFlight = false;
        state.abortController = null;
        for (const observer of observers) {
          observer.error(err);
        }
        scheduleNextFlush(opName);
      },
    });
  }

  const link = new ApolloLink((operation, forward) => {
    if (!isMutation(operation) || !targets.has(operation.operationName)) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const opName = operation.operationName;
      const stateKey = getStateKey(opName, operation.variables as TVarsType);
      const state = getState(stateKey);

      // Store operation and forward for the first call or when not in flight
      if (!state.operation || !state.inFlight) {
        state.operation = operation;
        state.forward = forward;
      }

      enqueue(stateKey, operation.variables as TVarsType, observer as IObserver);

      // Cleanup function
      return () => {
        if (state.timer) {
          clearTimeout(state.timer);
          state.timer = null;
        }

        if (state.inFlight) {
          state.abortController?.abort(AbortReason.Explicit);
          state.abortController = null;
          state.inFlight = false;
        }
      };
    });
  });

  /**
   * Escape hatch to flush a queued operation immediately instead of waiting for
   * its debounce window - e.g. on input blur, before navigation. No-op if
   * nothing is queued; if a previous mutation is still in flight the pending
   * batch waits for its scheduled flush as usual.
   */
  function flushNow(opName: string, partitionKey?: string): void {
    const stateKey = partitionKey ? `${opName}:${partitionKey}` : opName;
    const state = stateByOperation.get(stateKey);
    if (!state) {
      return;
    }
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    flush(stateKey);
  }

  return { link, flushNow };
}

/**
 * Backwards-compatible thin wrapper. Existing callers that only need the
 * link can keep using this; new callers that need flushNow should use
 * createQueuedMutationsController.
 */
export function createQueuedMutationsLink(config: IQueueConfig): ApolloLink {
  return createQueuedMutationsController(config).link;
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

/**
 * Helper function to create a properly typed queue target.
 * This preserves type safety when defining each target while allowing
 * heterogeneous targets in the config array.
 */
export function createQueueTarget<TVars extends Record<string, unknown>>(
  name: string,
  config: IQueueTargetConfig<TVars>,
): IQueueTarget {
  return { name, config: config as IQueueTargetConfig };
}

export const queuedMutationsController = createQueuedMutationsController({
  targets: [createQueueTarget("UpdateShortCartItemQuantity", updateShortCartItemQuantityConfig)],
});

// Backwards-compatible alias. Existing consumers import the link directly; new
// consumers can reach flushNow via the controller.
export const queuedMutationsLink = queuedMutationsController.link;
