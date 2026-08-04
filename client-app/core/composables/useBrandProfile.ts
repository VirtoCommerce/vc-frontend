import { computed } from "vue";
import { MODULE_XAPI_KEYS, MODULE_XFRONTEND_KEYS } from "@/core/constants/modules";
import { useModuleSettings } from "./useModuleSettings";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ABSOLUTE_URL = /^https?:\/\//i;
const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
// schema.org wants a dialable international number; the setting's own help text says the same.
const INTERNATIONAL_PHONE = /^\+[\d\s().-]{6,}$/;

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
 * Keeps only real calendar dates in `YYYY-MM-DD`. The setting is free ShortText, and
 * `foundingDate: "last spring"` is invalid structured data — better omitted than published.
 */
export function toIsoCalendarDate(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || !ISO_CALENDAR_DATE.test(trimmed)) {
    return undefined;
  }

  // Round-tripped, not just parsed: an out-of-range day rolls over silently (2026-02-30 becomes
  // 2026-03-02) instead of producing an invalid date.
  const parsed = new Date(`${trimmed}T00:00:00Z`);

  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed ? undefined : trimmed;
}

/** Splits the newline-separated `SameAs` LongText into absolute, deduplicated profile urls. */
export function toProfileUrls(value: string | undefined, origin: string): string[] {
  const urls = new Set<string>();

  for (const line of value?.split(/\r?\n/) ?? []) {
    const trimmed = line.trim();

    // A profile is off-site by definition. Resolving a relative value against the browsing
    // origin would claim one of the store's own pages as an external profile of itself.
    if (!ABSOLUTE_URL.test(trimmed)) {
      continue;
    }

    const absolute = toAbsoluteUrl(trimmed, origin);

    if (absolute) {
      urls.add(absolute);
    }
  }

  return [...urls];
}

/**
 * Store-level brand facts for the storefront's published identity (JSON-LD, Open Graph).
 *
 * Sourced from the public `XFrontend.BrandProfile.*` store settings (vc-module-x-frontend),
 * which arrive through the existing `store.settings.modules` passthrough — no typed field, so
 * every value is validated here before it can reach the markup.
 */
export function useBrandProfile() {
  const { themeContext } = useThemeContext();
  const { whiteLabelingLogoUrl, isOrganizationLogoUploaded } = useWhiteLabeling();
  const { getSettingValue } = useModuleSettings(MODULE_XFRONTEND_KEYS.MODULE_ID);
  const { getSettingValue: getXapiSettingValue } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

  const origin = computed(() => globalThis.location.origin);
  const storeName = computed(() => themeContext.value?.storeName);

  /** Settings are an untyped name/value list, and every brand-profile one defaults to "". */
  function settingText(name: string): string | undefined {
    const value = getSettingValue(name);
    return typeof value === "string" ? value.trim() || undefined : undefined;
  }

  const tagline = computed(() => settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_TAGLINE));

  // Collapsed, not just trimmed: LongText keeps the merchant's line breaks, and those would end
  // up inside a `content` attribute and a JSON string.
  const description = computed(() =>
    settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_DESCRIPTION)?.replace(/\s+/g, " "),
  );

  const sameAs = computed(() => toProfileUrls(settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SAME_AS), origin.value));

  const shareImageUrl = computed(() =>
    toAbsoluteUrl(settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_SHARE_IMAGE_URL), origin.value),
  );

  const foundingDate = computed(() =>
    toIsoCalendarDate(settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_FOUNDING_DATE)),
  );

  const contactPhone = computed(() => {
    const displayed = getXapiSettingValue(MODULE_XAPI_KEYS.SUPPORT_PHONE_NUMBER);

    // The header's display number is the fallback, not the source: it is free text, so it is
    // only usable when it happens to already be dialable. Both candidates face the same gate —
    // an extension or a missing country code makes the number useless to an agent, and a wrong
    // number published as structured data is worse than none.
    const candidate =
      settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE) ??
      (typeof displayed === "string" ? displayed.trim() || undefined : undefined);

    return candidate && INTERNATIONAL_PHONE.test(candidate) ? candidate : undefined;
  });

  const storeBrandLogoUrl = computed(() => {
    const configured = toAbsoluteUrl(settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_LOGO_URL), origin.value);

    if (configured) {
      return configured;
    }

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
    description: description.value,
    sameAs: sameAs.value,
    tagline: tagline.value,
    contactPhone: contactPhone.value,
    foundingDate: foundingDate.value,
  }));

  return {
    storeName,
    storeUrl,
    storeBrandLogoUrl,
    description,
    tagline,
    sameAs,
    shareImageUrl,
    contactPhone,
    foundingDate,
    organizationFacts,
  };
}
