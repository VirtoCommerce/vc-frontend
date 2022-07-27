import getOrganizationContacts from "@/xapi/graphql/account/queries/getOrganizationContacts";
import { ContactType } from "@/xapi/types";
import { ref, shallowRef, Ref, readonly, computed } from "vue";
import { Logger } from "@/core/utilities";
import { ISortInfo } from "../types";
import { DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import { getSortingExpression } from "../utils";
import useUser from "./useUser";
import _ from "lodash";
import { OrganizationContactType } from "@/core/types";

export default () => {
  const loading: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(6);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const contacts: Ref<OrganizationContactType[]> = shallowRef<OrganizationContactType[]>([]);
  const sort: Ref<ISortInfo> = ref({
    column: "name",
    direction: SORT_ASCENDING,
  });

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
      contacts.value = _.map(response.items, (item: ContactType) => {
        return {
          ...item,
          fullName: getFullName(item),
          role: "Administrator",
          email: item.emails?.length ? item.emails[0] : undefined,
        };
      });
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

function getFullName(contact: ContactType): string {
  return contact.fullName || contact.name || `${contact.firstName} ${contact.lastName}`;
}

function getSearchPhrase(keyword: string): string {
  return keyword ? `name:"${keyword}"` : "";
}
