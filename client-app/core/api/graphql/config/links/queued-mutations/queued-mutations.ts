import { ApolloLink, Observable } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { useQueuedMutations } from "@/core/composables/useQueuedMutations";
import { isMutation, defaultMergeVariables } from "../utils";
import type { IQueueConfig, IQueueTargetConfig, IOperationState } from "./types";
import type { UpdateShortCartItemQuantityMutationVariables } from "@/core/api/graphql/types";
import type { DefaultContext } from "@apollo/client/core";

const DEFAULT_DEBOUNCE_MS = 1000;

/**
 * Creates a queued mutations link.
 * @description Imagine user adds 5 items of product A to cart, then adds 3 items of product B to cart, then changes quantity of product A to 2. The link will merge the variables and send only one network request to the server.
 * Further actions happening while network request is in flight + debounce time are queued and will be merged with the next network request.
 * @param config @link{IQueueConfig} - The configuration for the queued mutations link.
 */
export function createQueuedMutationsLink<TVars extends Record<string, unknown>>(
  config: IQueueConfig<TVars>,
): ApolloLink {
  const targets = new Set<string>(Array.from(config.targets.map((t) => t.name)));

  const targetConfigMap = new Map<string, Required<IQueueTargetConfig<TVars>>>(
    config.targets.map((target) => [
      target.name,
      {
        debounceMs: target.config?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
        mergeQueued: target.config?.mergeQueued ?? ((a, b) => defaultMergeVariables(a, b)),
      },
    ]),
  );

  const stateByOperation = new Map<string, IOperationState<TVars>>();
  const { setQueuedTotal } = useQueuedMutations();

  function getState(opName: string): IOperationState<TVars> {
    const state = stateByOperation.get(opName);

    if (state) {
      return state;
    }

    const newState: IOperationState<TVars> = {
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

  function getTargetConfig(opName: string) {
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

  function enqueue(
    opName: string,
    variables: TVars,
    next: (value: unknown) => void,
    complete: () => void,
    error: (reason?: unknown) => void,
  ): void {
    const state = getState(opName);
    const { mergeQueued } = getTargetConfig(opName);

    // Add observer
    state.observers.push({ next, complete, error });

    // Merge variables immediately
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
      fetchOptions: { ...(prev?.fetchOptions ?? {}), signal: state.abortController?.signal },
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

  return new ApolloLink((operation, forward) => {
    if (!isMutation(operation) || !targets.has(operation.operationName)) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const opName = operation.operationName;
      const state = getState(opName);

      // Store operation and forward for the first call or when not in flight
      if (!state.operation || !state.inFlight) {
        state.operation = operation;
        state.forward = forward;
      }

      const next = (value: unknown) => observer.next(value as never);
      const complete = () => observer.complete();
      const error = (reason?: unknown) => observer.error(reason);

      enqueue(opName, operation.variables as TVars, next, complete, error);

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
