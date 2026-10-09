import { computed, readonly, shallowRef, triggerRef } from "vue";
import type { ComputedRef } from "vue";

export type PluginStateType = "pending" | "loaded" | "failed" | "skipped";

export interface IPluginStatusType {
  name: string;
  state: PluginStateType;
  reason?: string;
}

const statuses = shallowRef(new Map<string, IPluginStatusType>());
/** Still pending, but past their deadline: no longer hold boxes. */
const expired = shallowRef(new Set<string>());
const waiters = new Map<string, ((status: IPluginStatusType) => void)[]>();
const finalWaiters = new Map<string, ((status: IPluginStatusType) => void)[]>();

const isFinal = (state: PluginStateType | undefined) => state !== undefined && state !== "pending";

/** Loader-only. The first final state wins: a late outcome after a timeout is ignored. */
export function setPluginStatus(name: string, state: PluginStateType, reason?: string): void {
  const current = statuses.value.get(name);
  if (isFinal(current?.state)) {
    return;
  }
  const status: IPluginStatusType = reason === undefined ? { name, state } : { name, state, reason };
  statuses.value.set(name, status);
  triggerRef(statuses);
  if (isFinal(state)) {
    for (const resolve of [...(waiters.get(name) ?? []), ...(finalWaiters.get(name) ?? [])]) {
      resolve(status);
    }
    waiters.delete(name);
    finalWaiters.delete(name);
  }
}

/** The load chunk has no budget of its own, so a pending plugin must not hold boxes forever. */
export function expirePendingAfter(name: string, ms: number): void {
  setTimeout(() => {
    if (statuses.value.get(name)?.state === "pending") {
      expired.value.add(name);
      triggerRef(expired);
      for (const resolve of waiters.get(name) ?? []) {
        resolve({ name, state: "pending", reason: `did not settle within ${ms}ms` });
      }
      waiters.delete(name);
    }
  }, ms);
}

/** Settled, expired, or never seen. */
export function isPluginSettled(name: string): boolean {
  return isFinal(statuses.value.get(name)?.state) || expired.value.has(name) || !statuses.value.has(name);
}

export function whenPluginSettled(name: string): Promise<IPluginStatusType> {
  const current = statuses.value.get(name);
  if (!current || isFinal(current.state) || expired.value.has(name)) {
    return Promise.resolve(current ?? { name, state: "skipped", reason: "not advertised by the platform" });
  }
  return new Promise((resolve) => {
    waiters.set(name, [...(waiters.get(name) ?? []), resolve]);
  });
}

/** Like `whenPluginSettled`, but an expired deadline does not count: a slow plugin is still on its way. */
export function whenPluginFinal(name: string): Promise<IPluginStatusType> {
  const current = statuses.value.get(name);
  if (!current || isFinal(current.state)) {
    return Promise.resolve(current ?? { name, state: "skipped", reason: "not advertised by the platform" });
  }
  return new Promise((resolve) => {
    finalWaiters.set(name, [...(finalWaiters.get(name) ?? []), resolve]);
  });
}

const plugins: ComputedRef<readonly IPluginStatusType[]> = computed(() => [...statuses.value.values()]);

/** Each federated plugin's state, reactively; the only production signal, as `Logger` is a no-op there. */
export function usePluginsStatus() {
  return {
    plugins: readonly(plugins),
    stateOf: (name: string): PluginStateType | undefined => statuses.value.get(name)?.state,
    isSettled: isPluginSettled,
    whenSettled: whenPluginSettled,
  };
}

/** Specs only. */
export function resetPluginStatuses(): void {
  statuses.value = new Map();
  expired.value = new Set();
  waiters.clear();
  finalWaiters.clear();
}
