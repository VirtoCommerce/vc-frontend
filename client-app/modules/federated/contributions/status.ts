import { computed, readonly, shallowRef, triggerRef } from "vue";
import type { ComputedRef } from "vue";

export type PluginStateType = "pending" | "loaded" | "failed" | "skipped";

export interface IPluginStatusType {
  name: string;
  state: PluginStateType;
  /** Why it failed or was skipped. */
  reason?: string;
}

const statuses = shallowRef(new Map<string, IPluginStatusType>());
/** Pending plugins past their deadline: still pending, but no longer worth holding a box for. */
const expired = shallowRef(new Set<string>());
const waiters = new Map<string, ((status: IPluginStatusType) => void)[]>();

const isFinal = (state: PluginStateType | undefined) => state !== undefined && state !== "pending";

/**
 * Host-side writer, called by the loader. A plugin settles once: a late outcome after a timeout
 * already reported it (a load that resolves after its budget) does not rewrite what was shown.
 */
export function setPluginStatus(name: string, state: PluginStateType, reason?: string): void {
  const current = statuses.value.get(name);
  if (isFinal(current?.state)) {
    return;
  }
  const status: IPluginStatusType = reason === undefined ? { name, state } : { name, state, reason };
  statuses.value.set(name, status);
  triggerRef(statuses);
  if (isFinal(state)) {
    for (const resolve of waiters.get(name) ?? []) {
      resolve(status);
    }
    waiters.delete(name);
  }
}

/**
 * Past `ms`, a still-pending plugin stops holding reserved boxes and placeholders: its load chunk
 * can hang with no budget of its own, and a box must never be held forever.
 */
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

/** Whether the host can stop waiting on `name`: it settled, it expired, or it was never declared. */
export function isPluginSettled(name: string): boolean {
  return isFinal(statuses.value.get(name)?.state) || expired.value.has(name) || !statuses.value.has(name);
}

/** Resolves once `name` settles or expires; immediately for a plugin the host never saw. */
export function whenPluginSettled(name: string): Promise<IPluginStatusType> {
  const current = statuses.value.get(name);
  if (!current || isFinal(current.state) || expired.value.has(name)) {
    return Promise.resolve(current ?? { name, state: "skipped", reason: "not advertised by the platform" });
  }
  return new Promise((resolve) => {
    waiters.set(name, [...(waiters.get(name) ?? []), resolve]);
  });
}

const plugins: ComputedRef<readonly IPluginStatusType[]> = computed(() => [...statuses.value.values()]);

/**
 * What became of each federated plugin, reactively. The only way to tell a missing feature from a
 * failed plugin in production, where `Logger` is a no-op.
 */
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
}
