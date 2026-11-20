import { createGlobalState } from "@vueuse/core";
import { computed, ref, readonly, onMounted } from "vue";
import { getOrganizations } from "@/core/api/graphql/account";
import { Logger, escapeFilterSyntaxValue } from "@/core/utilities";
import { ContactStatus } from "@/shared/company/types";
import type { OrganizationFieldsType } from "@/core/api/graphql/account";

const ORGANIZATIONS_PER_PAGE = 30;
const SEARCH_THRESHOLD = 10;

function _useUserOrganizations() {
  const organizations = ref<OrganizationFieldsType[]>([]);
  const loading = ref(false);
  const hasNextPage = ref(true);
  const endCursor = ref<string | undefined>(undefined);
  const totalCount = ref(0);
  const totalOrganizations = ref(0);
  const initialized = ref(false);
  const searchPhrase = ref("");

  const pagesCount = computed(() => Math.ceil(totalCount.value / ORGANIZATIONS_PER_PAGE));
  const currentPage = computed(() => Math.ceil(organizations.value.length / ORGANIZATIONS_PER_PAGE));
  const isShowSearch = computed(() => totalOrganizations.value > SEARCH_THRESHOLD);

  // Note: At this moment, Contact/Member query supports filters inside and it breaks encoding.
  // We need to apply this workaround by quoting the phrase as a filter-syntax string literal.
  const formattedSearchPhrase = computed(() =>
    searchPhrase.value ? `"${escapeFilterSyntaxValue(searchPhrase.value)}"` : "",
  );

  // The phrase the latest first page asked for; reset() clears it.
  let searchedPhrase = "";
  // The request sent last; reset() lets a new one start while an older one is still on its way.
  let lastRequestId = 0;

  async function loadOrganizations(): Promise<void> {
    if (loading.value || !hasNextPage.value) {
      return;
    }

    loading.value = true;
    const requestId = ++lastRequestId;
    const after = endCursor.value;
    if (after === undefined) {
      searchedPhrase = formattedSearchPhrase.value;
    }
    const phrase = searchedPhrase;
    // Dropped if a newer request was sent, or if search() or reset() has asked for another phrase or page since.
    const isOutdated = () => requestId !== lastRequestId || phrase !== searchedPhrase || after !== endCursor.value;
    let isStale = false;

    try {
      const result = await getOrganizations({
        after,
        first: ORGANIZATIONS_PER_PAGE,
        sort: "name:asc",
        searchPhrase: phrase,
        statuses: [ContactStatus.Approved],
      });

      isStale = isOutdated();

      if (!isStale) {
        organizations.value.push(...result.items);

        hasNextPage.value = result.pageInfo.hasNextPage;
        endCursor.value = result.pageInfo.endCursor;
        totalCount.value = result.totalCount;

        if (!phrase) {
          totalOrganizations.value = result.totalCount;
        }

        initialized.value = true;
      }
    } catch (error) {
      Logger.error(`${_useUserOrganizations.name}.${loadOrganizations.name}`, error);
      isStale = isOutdated();

      // A failed answer nobody waits for is dropped like a late one.
      if (!isStale) {
        throw error;
      }
    } finally {
      if (requestId === lastRequestId) {
        loading.value = false;
      }
    }

    // Nothing newer is on its way: search the field's phrase again, so a search() for it made
    // before this answer lands keeps it instead of asking again.
    if (isStale && requestId === lastRequestId) {
      await search();
    }
  }

  async function search(): Promise<void> {
    searchedPhrase = formattedSearchPhrase.value;
    organizations.value = [];
    endCursor.value = undefined;
    hasNextPage.value = true;
    totalCount.value = 0;

    await loadOrganizations();
  }

  function reset(): void {
    organizations.value = [];
    endCursor.value = undefined;
    hasNextPage.value = true;
    totalCount.value = 0;
    totalOrganizations.value = 0;
    initialized.value = false;
    loading.value = false;
    searchPhrase.value = "";
    searchedPhrase = "";
  }

  onMounted(() => {
    if (!initialized.value) {
      void search();
    }
  });

  return {
    searchPhrase,
    organizations: readonly(organizations),
    loading: readonly(loading),
    hasNextPage: readonly(hasNextPage),
    totalCount: readonly(totalCount),
    totalOrganizations: readonly(totalOrganizations),
    initialized: readonly(initialized),
    pagesCount,
    currentPage,
    isShowSearch,
    loadOrganizations,
    search,
    reset,
  };
}

export const useUserOrganizations = createGlobalState(_useUserOrganizations);
