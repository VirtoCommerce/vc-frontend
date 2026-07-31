import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useBrandProfile } from "./useBrandProfile";
import { useLanguages } from "./useLanguages";

export type OrganizationFactsType = {
  /** Stable JSON-LD `@id`, e.g. `https://store.example.com/#organization`. */
  id?: string;
  name?: string;
  /** Absolute store URL. */
  url?: string;
  /** Absolute URL of the *store brand* logo (never a buyer organization's logo). */
  logoUrl?: string;
};

const SCHEMA_ORG_CONTEXT = "https://schema.org";

/** `OnlineStore` is a subtype of `OnlineBusiness` -> `Organization`, so consumers matching
 * on `Organization` still resolve it. */
const ORGANIZATION_TYPE = "OnlineStore";

function nonBlank(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Builds the schema.org Organization node published on the homepage.
 *
 * A key is emitted only when its value resolves to a non-blank string — an empty `logo` or
 * `url` asserts something false, so omission is preferable. Returns `null` when the store
 * name is unavailable, since a nameless organization cannot be identified and would only
 * pollute entity resolution.
 */
// The nullable return IS the contract: `null` means "do not publish a node", which the caller
// must distinguish from an empty object.
// eslint-disable-next-line sonarjs/function-return-type
export function buildOrganizationNode(facts: OrganizationFactsType): Record<string, unknown> | null {
  const name = nonBlank(facts.name);

  if (!name) {
    return null;
  }

  const id = nonBlank(facts.id);
  const url = nonBlank(facts.url);
  const logo = nonBlank(facts.logoUrl);

  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": ORGANIZATION_TYPE,
    ...(id ? { "@id": id } : {}),
    name,
    ...(url ? { url } : {}),
    ...(logo ? { logo } : {}),
  };
}

/**
 * Publishes the store's Organization JSON-LD on the homepage.
 *
 * Mounted from `App.vue` rather than `home.vue`: `/` has no dedicated route and resolves
 * through the previewer priority chain (Builder.io -> Virto Pages -> internal), so
 * `home.vue` does not mount when a CMS homepage exists. `App.vue` sits above that.
 *
 * Google recommends this markup on the homepage or a single "about" page and explicitly not
 * on every page, hence the route gate. Locale-prefixed homepages ("/fr", "/fr/") count.
 */
export function useOrganizationSchema() {
  const route = useRoute();
  // `getUrlWithoutLocale` (not the `...PossibleLocale` variant) strips only locales the store
  // actually supports. The "possible" variant matches any two-letter segment, so it would treat
  // an unrelated "/xy" as the homepage. `app-runner` uses that looser variant only because it
  // runs before the store is loaded; by the time App.vue mounts, the real list is available.
  const { getUrlWithoutLocale } = useLanguages();
  const { organizationFacts } = useBrandProfile();

  const isHomePage = computed(() => getUrlWithoutLocale(route.path) === "/");

  return useHead({
    script: () => {
      if (!isHomePage.value) {
        return [];
      }

      const node = buildOrganizationNode(organizationFacts.value);

      return node ? [{ type: "application/ld+json", innerHTML: JSON.stringify(node) }] : [];
    },
  });
}
