import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useBrandProfile } from "./useBrandProfile";
import { useLanguages } from "./useLanguages";

export type OrganizationFactsType = {
  id?: string;
  name?: string;
  url?: string;
  /** The *store brand* logo, never a buyer organization's. Expected already absolute. */
  logoUrl?: string;
};

const SCHEMA_ORG_CONTEXT = "https://schema.org";

/** Subtype of `OnlineBusiness` -> `Organization`, so consumers matching `Organization` resolve it. */
const ORGANIZATION_TYPE = "OnlineStore";

function nonBlank(value?: string): string | undefined {
  // `||` not `??`: an empty string must collapse to undefined too.
  return value?.trim() || undefined;
}

/**
 * Builds the homepage Organization node. Callers must pass already-sanitised urls
 * (`useBrandProfile` does this) — the builder only drops blanks.
 *
 * Blank keys are omitted rather than emitted: an empty `logo` asserts something false. Returns
 * `null` when the name is missing, since a nameless organization only pollutes entity resolution.
 */
// The nullable return is the contract: `null` means "publish nothing".
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
 * Publishes the store's Organization JSON-LD on the homepage only (Google recommends against
 * every page).
 *
 * Lives in `App.vue`, not `home.vue`: `/` has no route and resolves through the previewer chain
 * (Builder.io -> Virto Pages -> internal), so `home.vue` never mounts when a CMS homepage exists.
 */
export function useOrganizationSchema() {
  const route = useRoute();
  // Strict helper: the `...PossibleLocale` variant matches any two-letter segment, so it would
  // treat "/xy" as the homepage. app-runner uses the loose one only because it runs pre-store.
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
