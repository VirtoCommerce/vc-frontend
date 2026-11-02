import { computed, toValue, watch } from "vue";
import { useGetOrganizationMemberOptionsQuery } from "@/core/api/graphql/organization";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import type { MaybeRefOrGetter } from "vue";

// The picker filters what it was given, so an organization with more members than this cannot reach the overflow
// (warned below); listing them all waits on server-side search in `VcSelect`.
export const ORGANIZATION_MEMBER_OPTIONS_LIMIT = 200;

/** A member the picker offers: the contact id the reports take, and the name it shows. */
export type OrganizationMemberOptionType = { id: string; name: string };

/** The organization's members by name, for a picker. Empty while there is no organization. */
export function useOrganizationMemberOptions(organizationId: MaybeRefOrGetter<string | undefined>) {
  const variables = computed(() => ({
    id: toValue(organizationId) ?? "",
    userId: globals.userId ?? "",
    first: ORGANIZATION_MEMBER_OPTIONS_LIMIT,
    sort: "name:asc",
  }));

  const { result, loading, error, onError } = useGetOrganizationMemberOptionsQuery(variables);

  onError((queryError) => {
    Logger.error("[company] organization member options failed:", queryError);
  });

  // An empty picker after a failed read would read as "no members"; the caller names the failure on the field.
  const failed = computed(() => error.value != null);

  const options = computed<OrganizationMemberOptionType[]>(() =>
    (result.value?.organization?.contacts?.items ?? []).map((contact) => ({
      id: contact.id,
      name: contact.fullName || contact.name || contact.id,
    })),
  );

  const totalCount = computed(() => result.value?.organization?.contacts?.totalCount ?? 0);

  // `immediate`: a cache hit fills the result during setup, so the count never changes.
  watch(
    totalCount,
    (count) => {
      if (count > ORGANIZATION_MEMBER_OPTIONS_LIMIT) {
        Logger.warn(
          `[company] the member picker lists only ${ORGANIZATION_MEMBER_OPTIONS_LIMIT} of ${count} members; the rest are unreachable.`,
        );
      }
    },
    { immediate: true },
  );

  return { options, totalCount, loading, failed };
}
