import type { useComponentsRegistry } from "@/shared/common/composables";

export {};

declare global {
  interface Window {
    vcComponentsRegistry?: {
      components: ReturnType<typeof useComponentsRegistry>["components"];
      registerComponent: ReturnType<typeof useComponentsRegistry>["registerComponent"];
      getComponents: ReturnType<typeof useComponentsRegistry>["getComponents"];
      unregisterComponent: ReturnType<typeof useComponentsRegistry>["unregisterComponent"];
    };
  }
}
