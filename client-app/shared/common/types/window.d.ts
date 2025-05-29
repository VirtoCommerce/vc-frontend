import type { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

export {};

declare global {
  interface Window {
    VCExtensionRegistry: Partial<ReturnType<typeof useExtensionRegistry>>;
  }
}
