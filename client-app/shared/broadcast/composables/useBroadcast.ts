/* eslint-disable @typescript-eslint/no-explicit-any,sonarjs/cognitive-complexity */
import { noop, tryOnScopeDispose, useEventListener } from "@vueuse/core";
import { Logger } from "@/core/utilities";

export enum TabsType {
  CURRENT = "current",
  OTHERS = "others",
  ALL = "all",
}
interface IUseBroadcastReturn {
  /** Add a listener function for the specified event. Automatic deletion on unmounting. */
  on: <T>(event: string, listener: (data: T) => void) => void;

  /** Remove the listener function for the specified event. */
  off: <T>(event: string, listener?: (data: T) => void) => void;

  /** Send data to other browser tabs subscribed to the specified event. */
  emit: <T>(
    event: string,
    /** The data to be sent. This must be a JSON-serializable object. */
    data?: T,
    /**
     * Enum indicating whether an event will be send to the current or to the other or to the all tabs.
     */
    tabsType?: TabsType,
  ) => Promise<void> | void;
}

const CHANNEL_NAME = "vc_cast";

const listeners: Record<string, ((data: any) => void)[]> = {};

function off(event: string, listener?: (data: any) => void) {
  if (!listeners[event]) {
    return;
  }

  if (typeof listener === "function") {
    const index = listeners[event].indexOf(listener);
    listeners[event].splice(index, 1);
  }

  if (!listener || !listeners[event].length) {
    delete listeners[event];
  }
}

function on(event: string, listener: (data: any) => void) {
  listeners[event] = listeners[event] || [];
  listeners[event].push(listener);
  /** Automatically deleted when unmounted. */
  tryOnScopeDispose(() => off(event, listener));
}

function isAsync(fn: (...args: unknown[]) => unknown): boolean {
  return fn.constructor.name === "AsyncFunction";
}

async function broadcast(event: string, data: any) {
  Logger.debug("[Broadcast][Event]", event, data);

  if (!listeners[event]) {
    return;
  }

  const asyncListeners = listeners[event].filter(isAsync);
  const syncListeners = listeners[event].filter((listener) => !isAsync(listener));
  await Promise.allSettled(asyncListeners.map((listener) => listener(data)));
  syncListeners.forEach((listener) => listener(data));
}

function broadcastChannelApiFactory(): IUseBroadcastReturn {
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = async ({ data: { event, data } }: { data: { event: string; data: unknown } }) =>
    await broadcast(event, data);

  async function emit(event: string, data: unknown, tabsType: TabsType = TabsType.OTHERS) {
    Logger.debug("[Broadcast][Emit]", event, data);

    if ([TabsType.ALL, TabsType.OTHERS].includes(tabsType)) {
      channel.postMessage({ event, data });
    }

    if ([TabsType.ALL, TabsType.CURRENT].includes(tabsType)) {
      return await broadcast(event, data);
    }
  }

  return <IUseBroadcastReturn>{ on, off, emit };
}

function localStorageApiFactory(): IUseBroadcastReturn {
  const storage = window.localStorage;
  const prefix = `__${CHANNEL_NAME}:`;
  const queue: Record<string, any[]> = {};

  function emit(event: string, data: any, includeSelf = false) {
    Logger.debug("[Broadcast][Emit]", event, data);

    const key = prefix + event;

    if (storage.getItem(key) === null) {
      storage.setItem(key, JSON.stringify(data));
      storage.removeItem(key);
    } else {
      /**
       * The queueing system ensures that multiple calls to the emit
       * function using the same name does not override each other's
       * values and makes sure that the next value is sent only when
       * the previous one has already been deleted from the storage.
       */
      queue[event] = queue[event] || [];
      queue[event].push(data);
    }

    if (includeSelf) {
      broadcast(event, data);
    }
  }

  useEventListener("storage", ({ key, newValue, oldValue }) => {
    if (!key?.startsWith(prefix)) {
      return;
    }

    const event = key.replace(prefix, "");

    if (oldValue === null) {
      const data = newValue === "undefined" ? undefined : (JSON.parse(newValue!) as string);

      broadcast(event, data);
    } else if (queue[event]) {
      emit(event, queue[event].shift());

      if (!queue[event].length) {
        delete queue[event];
      }
    }
  });

  return <IUseBroadcastReturn>{ on, off, emit };
}

const api = ((global) => {
  if ("BroadcastChannel" in global) {
    return broadcastChannelApiFactory();
  } else if ("localStorage" in global) {
    return localStorageApiFactory();
  }

  /**
   * When there is no support for any of the APIs we use for messaging,
   * it is sufficient to present an empty api.
   */
  return { on: noop, off: noop, emit: noop };
})(globalThis);

export function useBroadcast(): IUseBroadcastReturn {
  return api;
}
