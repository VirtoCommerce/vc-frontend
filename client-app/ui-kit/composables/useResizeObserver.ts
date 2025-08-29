import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useDebounce } from "./useDebounce";
import type { Ref } from "vue";

export interface IResizeObserverOptions {
  debounceMs?: number;
}

export interface IResizeObserverReturn {
  isSupported: Ref<boolean>;
  stop: () => void;
}

export function useResizeObserver(
  target: Ref<HTMLElement | null>,
  callback: () => void,
  options: IResizeObserverOptions = {},
): IResizeObserverReturn {
  const { debounceMs = 0 } = options;

  const isSupported = ref(typeof window !== "undefined" && "ResizeObserver" in window);
  let observer: ResizeObserver | null = null;

  const { debouncedFunc: debouncedCallback, cancel } =
    debounceMs > 0 ? useDebounce(callback, debounceMs) : { debouncedFunc: callback, cancel: () => {} };

  const cleanup = () => {
    if (observer) {
      if (target.value) {
        observer.unobserve(target.value);
      }
      observer.disconnect();
      observer = null;
    }
    cancel();
  };

  const stop = () => {
    cleanup();
  };

  const startObserving = () => {
    if (!isSupported.value || !target.value) {
      return;
    }

    cleanup();

    observer = new ResizeObserver(() => {
      debouncedCallback();
    });

    observer.observe(target.value);
  };

  watch(target, startObserving, { immediate: true });

  onMounted(() => {
    startObserving();
  });

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    isSupported,
    stop,
  };
}
