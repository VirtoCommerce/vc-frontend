import { computed } from "vue";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ABSOLUTE_URL = /^https?:\/\//i;

/** Resolves to an absolute http(s) url, or `undefined` — so a `javascript:` value can't reach the markup. */
export function toAbsoluteUrl(value: string | undefined, origin: string): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const resolved = new URL(trimmed, origin);
    return ALLOWED_PROTOCOLS.has(resolved.protocol) ? resolved.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Store-level brand facts for the storefront's published identity (JSON-LD, Open Graph).
 *
 * Phase 1 only. `store.brandProfile` takes precedence here once it lands, adding sameAs,
 * description, tagline, shareImageUrl and foundingDate.
 */
export function useBrandProfile() {
  const { themeContext } = useThemeContext();
  const { whiteLabelingLogoUrl, isOrganizationLogoUploaded } = useWhiteLabeling();

  const origin = computed(() => globalThis.location.origin);
  const storeName = computed(() => themeContext.value?.storeName);

  const storeBrandLogoUrl = computed(() => {
    // White labeling swaps logoUrl for the signed-in buyer organization's own logo. Publishing
    // that would attribute a customer's branding to the merchant.
    if (whiteLabelingLogoUrl.value && !isOrganizationLogoUploaded.value) {
      return toAbsoluteUrl(whiteLabelingLogoUrl.value, origin.value);
    }

    return toAbsoluteUrl(themeContext.value?.settings?.logo_image, origin.value);
  });

  const storeUrl = computed(() => {
    // A relative value is rejected, not resolved: unlike a logo filename, a relative storeUrl is
    // misconfiguration, and resolving it would publish the visitor's host (e.g. a staging domain)
    // as the brand's canonical url.
    const configured = themeContext.value?.storeUrl?.trim();
    const absolute = configured && ABSOLUTE_URL.test(configured) ? toAbsoluteUrl(configured, origin.value) : undefined;

    return absolute ?? `${origin.value}/`;
  });

  // Structurally an OrganizationFactsType, left unannotated so this module needs no import from
  // useOrganizationSchema — keeps the dependency single-directional.
  const organizationFacts = computed(() => ({
    id: `${origin.value}/#organization`,
    name: storeName.value,
    url: storeUrl.value,
    logoUrl: storeBrandLogoUrl.value,
  }));

  return {
    storeName,
    storeUrl,
    storeBrandLogoUrl,
    organizationFacts,
  };
}
