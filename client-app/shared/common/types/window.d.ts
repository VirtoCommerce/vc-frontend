import type { CacheTypePoliciesDebugType } from "@/core/api/graphql/config/registerCacheTypePolicies";
import type { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

export {};

declare global {
  interface Window {
    VCExtensionRegistry: Partial<ReturnType<typeof useExtensionRegistry>>;
    /** Who owns which Apollo type policy, and which registrations were refused. Development only. */
    modulesCacheDebug: CacheTypePoliciesDebugType;
  }
}
