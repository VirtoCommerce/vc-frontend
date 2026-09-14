import type { CacheTypePoliciesDebugType } from "@/core/api/graphql/config/registerCacheTypePolicies";
import type { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

export {};

declare global {
  interface Window {
    /** Optional: assigned only in development, so a reader must handle its absence. */
    VCExtensionRegistry?: Partial<ReturnType<typeof useExtensionRegistry>>;
    /**
     * Who owns which Apollo type policy, and which registrations were refused. Development only —
     * hence optional: declaring it always-present let `window.modulesCacheDebug.owners.get(x)`
     * type-check and ship, then throw in production where nothing ever assigns it.
     */
    modulesCacheDebug?: CacheTypePoliciesDebugType;
  }
}
