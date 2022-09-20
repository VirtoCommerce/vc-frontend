import { getOrganizationContacts } from "@/xapi/graphql/organization";
import { ContactType, InputUpdateContactType } from "@/xapi/types";
import { ref, shallowRef, readonly, computed } from "vue";
import { getSortingExpression, Logger } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import _ from "lodash";
import { ISortInfo } from "@/core/types";
import { useI18n } from "vue-i18n";
import { convertToExtendedContact, convertToInputUpdateContact, ExtendedContactType } from "@/shared/company";
import updateContact from "@/xapi/graphql/account/mutations/updateContact";

export default function useOrganizationContacts() {
  const loading = ref(false);
  const itemsPerPage = ref(DEFAULT_PAGE_SIZE);
  const pages = ref(0);
  const page = ref(1);
  const keyword = ref("");
  const filter = ref("");
  const contacts = shallowRef<ExtendedContactType[]>([]);
  const sort = ref<ISortInfo>({
    column: "name",
    direction: SORT_ASCENDING,
  });

  const { t } = useI18n();
  const { organization } = useUser();

  async function loadContacts() {
    loading.value = true;

    const organizationId: string | undefined = organization.value!.id;

    if (!organizationId) {
      return;
    }

    const sortingExpression: string = getSortingExpression(sort.value);
    const filterExpression: string = [keyword.value, filter.value].filter(Boolean).join(" ");

    try {
      const response = await getOrganizationContacts(organizationId, {
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        sort: sortingExpression,
        searchPhrase: filterExpression,
      });

      const contactFullNameFallback: string = t("pages.company.members.invite_sent");

      contacts.value = _.map(response.items, (item: ContactType) =>
        convertToExtendedContact(item, contactFullNameFallback)
      );
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${loadContacts.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateMember(contact: ExtendedContactType): Promise<void> {
    loading.value = true;

    try {
      const payload: InputUpdateContactType = convertToInputUpdateContact(contact);
      await updateContact(payload);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${updateMember.name}`, e);
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
    filter,
    loading: readonly(loading),
    contacts: computed(() => contacts.value),
    loadContacts,
    updateMember,
  };
}
