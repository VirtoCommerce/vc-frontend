import getOrganizationContacts from "@/xapi/graphql/account/queries/getOrganizationContacts";
import { ContactType } from "@/xapi/types";
import { ref, shallowRef, Ref, readonly, computed } from "vue";
import { Logger } from "@/core/utilities";
import { ISortInfo } from "../types";
import { DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import { convertToOrganizationContact, getSortingExpression } from "../utils";
import useUser from "./useUser";
import _ from "lodash";
import { OrganizationContactType } from "@/core/types";
import { useI18n } from "vue-i18n";

export default () => {
  const loading: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(DEFAULT_PAGE_SIZE);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const contacts: Ref<OrganizationContactType[]> = shallowRef<OrganizationContactType[]>([]);
  const sort: Ref<ISortInfo> = ref({
    column: "name",
    direction: SORT_ASCENDING,
  });

  const { t } = useI18n();
  const { user } = useUser();

  async function loadContacts() {
    loading.value = true;

    const sortingExpression: string = getSortingExpression(sort.value);
    const organizationId: string | undefined = user.value.contact!.organizationId;

    if (!organizationId) {
      return;
    }

    try {
      const response = await getOrganizationContacts(organizationId, {
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        sort: sortingExpression,
        searchPhrase: getSearchPhrase(keyword.value),
      });
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
      contacts.value = _.map(response.items, (item: ContactType) => convertToOrganizationContact(item, t));
    } catch (e) {
      Logger.error("useOrganizationContacts.loadContacts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    sort,
    itemsPerPage,
    pages: readonly(pages),
    page,
    keyword,
    loading: readonly(loading),
    contacts: computed(() => contacts.value),
    loadContacts,
  };
};

function getSearchPhrase(keyword: string): string {
  return keyword ? `"${keyword}"` : "";
}
