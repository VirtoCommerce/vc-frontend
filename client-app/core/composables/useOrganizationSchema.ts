import { useHead } from "@unhead/vue";
import { useBrandProfile } from "./useBrandProfile";
import { useIsHomePage } from "./useIsHomePage";

export type OrganizationFactsType = {
  id?: string;
  name?: string;
  url?: string;
  /** The *store brand* logo, never a buyer organization's. Expected already absolute. */
  logoUrl?: string;
  /** One or two sentences on what the store sells. Expected already whitespace-collapsed. */
  description?: string;
  /** Absolute profile urls linking the domain to brands an agent already knows. */
  sameAs?: string[];
  tagline?: string;
  /** Expected already validated as an international number. */
  contactPhone?: string;
  /** Expected already validated as an ISO 8601 calendar date. */
  foundingDate?: string;
};

const SCHEMA_ORG_CONTEXT = "https://schema.org";

/** Subtype of `OnlineBusiness` -> `Organization`, so consumers matching `Organization` resolve it. */
const ORGANIZATION_TYPE = "OnlineStore";

const CONTACT_TYPE = "Customer Service";

function nonBlank(value?: string): string | undefined {
  // `||` not `??`: an empty string must collapse to undefined too.
  return value?.trim() || undefined;
}

/**
 * Builds the homepage Organization node from already-sanitised facts (`useBrandProfile` does
 * that); the builder only drops blanks, omitting the key rather than emitting an empty value.
 *
 * Returns `null` when the name is missing — publish nothing.
 */
// eslint-disable-next-line sonarjs/function-return-type
export function buildOrganizationNode(facts: OrganizationFactsType): Record<string, unknown> | null {
  const name = nonBlank(facts.name);

  if (!name) {
    return null;
  }

  const id = nonBlank(facts.id);
  const url = nonBlank(facts.url);
  const logo = nonBlank(facts.logoUrl);
  const description = nonBlank(facts.description);
  const slogan = nonBlank(facts.tagline);
  const foundingDate = nonBlank(facts.foundingDate);
  const telephone = nonBlank(facts.contactPhone);
  const sameAs = facts.sameAs?.map(nonBlank).filter((value): value is string => !!value) ?? [];

  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": ORGANIZATION_TYPE,
    ...(id ? { "@id": id } : {}),
    name,
    ...(url ? { url } : {}),
    ...(logo ? { logo } : {}),
    ...(description ? { description } : {}),
    ...(slogan ? { slogan } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(telephone ? { contactPoint: { "@type": "ContactPoint", telephone, contactType: CONTACT_TYPE } } : {}),
    ...(foundingDate ? { foundingDate } : {}),
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
  const isHomePage = useIsHomePage();
  const { organizationFacts } = useBrandProfile();

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
