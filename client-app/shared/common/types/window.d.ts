import type { useComponentsRegistry } from "@/shared/common/composables";

export {};

declare global {
  interface Window {
    vcComponentsRegistry: Partial<ReturnType<typeof useComponentsRegistry>>;
  }
}
