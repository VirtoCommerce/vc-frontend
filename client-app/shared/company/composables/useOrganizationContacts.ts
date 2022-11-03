import { computed, readonly, ref, shallowRef, unref } from "vue";
import _ from "lodash";
import { useI18n } from "vue-i18n";
import { MaybeRef } from "@vueuse/core";
import {
  ContactType,
  getOrganizationContacts,
  InputRemoveMemberFromOrganizationType,
  lockOrganizationContact,
  removeMemberFromOrganization as _removeMemberFromOrganization,
  unlockOrganizationContact,
} from "@/xapi";
import { DEFAULT_PAGE_SIZE, getSortingExpression, ISortInfo, Logger, SORT_ASCENDING } from "@/core";
import { convertToExtendedContact, ExtendedContactType } from "@/shared/company";
import { useNotifications } from "@/shared/notification";

export default function useOrganizationContacts(organizationId: MaybeRef<string>) {
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
  const notifications = useNotifications();

  async function fetchContacts() {
    loading.value = true;

    const sortingExpression: string = getSortingExpression(sort.value);
    const filterExpression: string = [keyword.value, filter.value].filter(Boolean).join(" ");

    try {
      const response = await getOrganizationContacts(unref(organizationId), {
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

  async function removeMemberFromOrganization(payload: InputRemoveMemberFromOrganizationType): Promise<void> {
    loading.value = true;

    try {
      await _removeMemberFromOrganization(payload);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${removeMemberFromOrganization.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    page.value = 1;
    await fetchContacts();
  }

  return {
    sort,
    itemsPerPage,
    page,
    keyword,
    filter,
    fetchContacts,
    lockContact,
    unlockContact,
    removeMemberFromOrganization,
    pages: readonly(pages),
    loading: readonly(loading),
    contacts: computed(() => contacts.value),
  };
}
