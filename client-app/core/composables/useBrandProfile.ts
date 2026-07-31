import { computed } from "vue";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Resolves a possibly-relative value to an absolute http(s) url.
 *
 * Structured data and Open Graph both require absolute urls, and the theme stores logos as
 * bare filenames or root-relative paths. Returns `undefined` for anything unresolvable or
 * for a non-http scheme, so a `javascript:` value can never reach the markup.
 */
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
 * Store-level brand facts used to publish the storefront's identity (JSON-LD, Open Graph).
 *
 * Phase 1 sources everything from data the storefront already has. When the backend
 * `store.brandProfile` contract lands (VCST-5536 phase 2) it takes precedence here, and the
 * remaining fields — sameAs, description, tagline, shareImageUrl, foundingDate — join it.
 */
export function useBrandProfile() {
  const { themeContext } = useThemeContext();
  const { whiteLabelingLogoUrl, isOrganizationLogoUploaded } = useWhiteLabeling();

  const origin = computed(() => globalThis.location.origin);

  const storeName = computed(() => themeContext.value?.storeName);

  /**
   * The *store brand* logo.
   *
   * White labeling replaces `logoUrl` with the signed-in buyer organization's own logo when
   * `isOrganizationLogoUploaded` is set. Organization markup describes the merchant, so that
   * variant must never be published — it would attribute a customer's logo to the store.
   */
  const storeBrandLogoUrl = computed(() => {
    if (whiteLabelingLogoUrl.value && !isOrganizationLogoUploaded.value) {
      return toAbsoluteUrl(whiteLabelingLogoUrl.value, origin.value);
    }

    return toAbsoluteUrl(themeContext.value?.settings?.logo_image, origin.value);
  });

  const storeUrl = computed(() => toAbsoluteUrl(themeContext.value?.storeUrl, origin.value) ?? `${origin.value}/`);

  // Structurally an `OrganizationFactsType`; not annotated as such so that this module needs
  // no import from `useOrganizationSchema`, keeping the dependency single-directional.
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
