import { computed } from "vue";
import { MODULE_XFRONTEND_KEYS } from "@/core/constants/modules";
import { useModuleSettings } from "./useModuleSettings";
import { useThemeContext } from "./useThemeContext";
import { useWhiteLabeling } from "./useWhiteLabeling";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ABSOLUTE_URL = /^https?:\/\//i;
const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
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

/** Keeps only real calendar dates in `YYYY-MM-DD`; the setting itself is free text. */
export function toIsoCalendarDate(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || !ISO_CALENDAR_DATE.test(trimmed)) {
    return undefined;
  }

  // An out-of-range day rolls over silently: 2026-02-30 parses as 2026-03-02.
  const parsed = new Date(`${trimmed}T00:00:00Z`);

  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed ? undefined : trimmed;
}

/** Splits the newline-separated `SameAs` LongText into absolute, deduplicated profile urls. */
export function toProfileUrls(value: string | undefined, origin: string): string[] {
  const urls = new Set<string>();

  for (const line of value?.split(/\r?\n/) ?? []) {
    const trimmed = line.trim();

    // A relative value resolved against the origin would list the store as its own profile.
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
 * Sourced from the public `XFrontend.BrandProfile.*` store settings, which arrive untyped
 * through the `store.settings.modules` passthrough and are validated here.
 */
export function useBrandProfile() {
  const { themeContext } = useThemeContext();
  const { whiteLabelingLogoUrl, isOrganizationLogoUploaded } = useWhiteLabeling();
  const { getSettingValue } = useModuleSettings(MODULE_XFRONTEND_KEYS.MODULE_ID);

  const origin = computed(() => globalThis.location.origin);
  const storeName = computed(() => themeContext.value?.storeName);

  /** Every brand-profile setting defaults to "", so blank collapses to undefined. */
  function settingText(name: string): string | undefined {
    const value = getSettingValue(name);
    return typeof value === "string" ? value.trim() || undefined : undefined;
  }

  const tagline = computed(() => settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_TAGLINE));

  // LongText, so it can carry line breaks that must not reach a `content` attribute.
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
    const configured = settingText(MODULE_XFRONTEND_KEYS.BRAND_PROFILE_CONTACT_PHONE);

    return configured && INTERNATIONAL_PHONE.test(configured) ? configured : undefined;
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
