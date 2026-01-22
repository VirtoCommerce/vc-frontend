import { createGlobalState } from "@vueuse/core";
import { computed, ref, readonly, onMounted } from "vue";
import { getOrganizations } from "@/core/api/graphql/account";
import { Logger } from "@/core/utilities";
import type { OrganizationFieldsFragment } from "@/core/api/graphql/types";

const ORGANIZATIONS_PER_PAGE = 30;
const SEARCH_THRESHOLD = 10;

function _useUserOrganizations() {
  const organizations = ref<OrganizationFieldsFragment[]>([]);
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

  /**
   * Note: At this moment, Contact/Member query supports filters inside and it breaks encoding.
   * We need to apply this workaround
   *  */
  const formattedSearchPhrase = computed(() => {
    if (!searchPhrase.value) {
      return "";
    }
    const escaped = searchPhrase.value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  async function loadOrganizations(): Promise<void> {
    if (loading.value || !hasNextPage.value) {
      return;
    }

    loading.value = true;

    try {
      const result = await getOrganizations({
        after: endCursor.value,
        first: ORGANIZATIONS_PER_PAGE,
        sort: "name:asc",
        searchPhrase: formattedSearchPhrase.value,
      });

      organizations.value.push(...result.items);

      hasNextPage.value = result.pageInfo.hasNextPage;
      endCursor.value = result.pageInfo.endCursor;
      totalCount.value = result.totalCount;

      if (!searchPhrase.value) {
        totalOrganizations.value = result.totalCount;
      }

      initialized.value = true;
    } catch (error) {
      Logger.error(`${_useUserOrganizations.name}.${loadOrganizations.name}`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function search(): Promise<void> {
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
  }

  onMounted(() => {
    if (!initialized.value) {
      void loadOrganizations();
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
