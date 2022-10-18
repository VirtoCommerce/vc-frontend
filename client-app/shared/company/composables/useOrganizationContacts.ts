import {
  getOrganizationContacts,
  lockOrganizationContact,
  unlockOrganizationContact,
} from "@/xapi/graphql/organization";
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
import { useNotifications } from "@/shared/notification";

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
  const notifications = useNotifications();

  async function fetchContacts() {
    loading.value = true;

    const organizationId: string | undefined = organization.value?.id;

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
      Logger.error(`${useOrganizationContacts.name}.${fetchContacts.name}`, e);
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

  async function lockContact(contact: ExtendedContactType): Promise<void> {
    loading.value = true;

    try {
      await lockOrganizationContact(contact.id);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${lockContact.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchContacts();

    notifications.success({
      text: t("shared.company.notifications.user_blocked"),
      duration: 10000,
      single: true,
    });
  }

  async function unlockContact(contact: ExtendedContactType): Promise<void> {
    loading.value = true;

    try {
      await unlockOrganizationContact(contact.id);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${unlockContact.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchContacts();

    notifications.success({
      text: t("shared.company.notifications.user_unblocked"),
      duration: 10000,
      single: true,
    });
  }

  return {
    sort,
    itemsPerPage,
    page,
    keyword,
    filter,
    fetchContacts,
    updateMember,
    lockContact,
    unlockContact,
    pages: readonly(pages),
    loading: readonly(loading),
    contacts: computed(() => contacts.value),
  };
}
