import { onBeforeUnmount } from "vue";

export interface IDebounceOptions {
  immediate?: boolean;
}

export interface IDebounceReturn {
  debouncedFunc: () => void;
  cancel: () => void;
  flush: () => void;
}

export function useDebounce(func: () => void, delay: number, options: IDebounceOptions = {}): IDebounceReturn {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const flush = () => {
    if (timeoutId) {
      cancel();
      func();
    }
  };

  const debouncedFunc = () => {
    cancel();

    if (options.immediate && timeoutId === null) {
      func();
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!options.immediate) {
        func();
      }
    }, delay);
  };

  onBeforeUnmount(() => {
    cancel();
  });

  return {
    debouncedFunc,
    cancel,
    flush,
  };
}
