/* eslint-disable sonarjs/no-nested-functions */
import { ApolloLink, Observable, ApolloError } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { isMutation, defaultMergeVariables } from "./utils";
import type { DefaultContext } from "@apollo/client/core";

type MergeVariablesFnType<TVars extends Record<string, unknown> = Record<string, unknown>> = (
  a: TVars,
  b: TVars,
  operationName: string,
) => TVars;

export type QueuePolicyType = "replace" | "concat" | "custom";

export interface IQueueConfig<TVars extends Record<string, unknown> = Record<string, unknown>> {
  // Operation names to manage. If empty, nothing is intercepted.
  targets: string[];
  // Debounce in ms per operation kind.
  debounceMs?: number;
  // Queueing behavior on subsequent calls while one is in-flight.
  policy?: QueuePolicyType;
  // Custom handler when policy === "custom"; return merged variables to enqueue or null to drop.
  customMerge?: (currentQueued: TVars | null, next: TVars, operationName: string) => TVars | null;
  // How to merge variables for "replace" (keep last) and "concat" (append) flows.
  mergeVariables?: MergeVariablesFnType<TVars>;
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
  // single pending item storage (for replace) or array (for concat/custom)
  queue: IPendingItem<TVars>[];
  // abort controller per in-flight network call
  abortController: AbortController | null;
}

export function createQueuedMutationsLink<TVars extends Record<string, unknown> = Record<string, unknown>>(
  config: IQueueConfig<TVars>,
): ApolloLink {
  console.log("config", config);
  const targets = new Set(config.targets);
  const debounceMs = config.debounceMs ?? 300;
  const policy: QueuePolicyType = config.policy ?? "replace";
  const merge: MergeVariablesFnType<TVars> = config.mergeVariables ?? ((a, b) => defaultMergeVariables(a, b));

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
    state.timer = setTimeout(() => {
      void flush(opName).catch(() => undefined);
    }, debounceMs);
  }

  function setReplaceQueue(
    state: IOperationState<TVars>,
    variables: TVars,
    next: (v: unknown) => void,
    complete: () => void,
    error: (r?: unknown) => void,
  ) {
    state.queue.forEach((item) => item.error(new ApolloError({ networkError: new Error(AbortReason.Explicit) })));
    state.queue = [{ variables, next, complete, error }];
  }

  function enqueue(
    opName: string,
    variables: TVars,
    next: (v: unknown) => void,
    complete: () => void,
    error: (r?: unknown) => void,
  ) {
    const state = getState(opName);

    // apply policy
    if (policy === "replace") {
      setReplaceQueue(state, variables, next, complete, error);
    } else if (policy === "concat") {
      state.queue.push({ variables, next, complete, error });
    } else if (policy === "custom" && config.customMerge) {
      const lastVars = state.queue.length ? state.queue[state.queue.length - 1].variables : null;
      const merged = config.customMerge(lastVars, variables, opName);
      if (merged) {
        state.queue.push({ variables: merged, next, complete, error });
      } else {
        // dropped by custom logic
        next(null);
        complete();
        return;
      }
    } else {
      // fallback to replace
      setReplaceQueue(state, variables, next, complete, error);
    }

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
    const mergedVariables = items.reduce<TVars>(
      (acc, cur, idx) => (idx === 0 ? cur.variables : merge(acc, cur.variables, opName)),
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
    console.log("operation", operation);
    if (!isMutation(operation) || !targets.has(operation.operationName)) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const opName = operation.operationName;
      console.log("opName", opName);

      const next = (value: unknown) => observer.next(value as never);
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
  targets: ["UpdateShortCartItemQuantity"],
  debounceMs: 1000,
});
