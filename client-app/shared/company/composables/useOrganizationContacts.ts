import { map } from "lodash-es";
import { computed, readonly, ref, shallowRef, unref } from "vue";
import { useI18n } from "vue-i18n";
import {
  getOrganizationContacts,
  lockOrganizationContact,
  removeMemberFromOrganization as _removeMemberFromOrganization,
  resendOrganizationInvite as _resendOrganizationInvite,
  revokeOrganizationInvite as _revokeOrganizationInvite,
  unlockOrganizationContact,
  changeOrganizationContactRole,
} from "@/core/api/graphql";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { getSortingExpression, Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { convertToExtendedContact } from "../utils";
import type {
  ContactType,
  CustomIdentityResultType,
  InputChangeOrganizationContactRoleType,
  InputRemoveMemberFromOrganizationType,
  InputResendOrganizationInviteType,
} from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { ExtendedContactType } from "@/shared/company";
import type { MaybeRef } from "vue";

export function useOrganizationContacts(organizationId: MaybeRef<string>) {
  const loading = ref(false);
  const itemsPerPage = ref(DEFAULT_PAGE_SIZE);
  const pages = ref(0);
  const page = ref(1);
  const keyword = ref("");
  const filter = ref("");
  const roleIds = ref<string[]>([]);
  const statuses = ref<string[]>([]);
  const contacts = shallowRef<ExtendedContactType[]>([]);
  const sort = ref<ISortInfo>({
    column: "name",
    direction: SortDirection.Ascending,
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
        roleIds: roleIds.value.length ? roleIds.value : undefined,
        statuses: statuses.value.length ? statuses.value : undefined,
      });

      const contactFullNameFallback: string = t("pages.company.members.invite_sent");

      contacts.value = map(response.items, (item: ContactType) =>
        convertToExtendedContact(item, contactFullNameFallback),
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

  async function revokeInvite(memberId: string): Promise<void> {
    loading.value = true;

    try {
      await _revokeOrganizationInvite(memberId);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${revokeInvite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    page.value = 1;
    await fetchContacts();

    notifications.success({
      text: t("pages.company.members.notifications.invite_revoked"),
      duration: 10000,
      single: true,
    });
  }

  async function resendInvite(payload: InputResendOrganizationInviteType): Promise<CustomIdentityResultType> {
    loading.value = true;

    try {
      return await _resendOrganizationInvite(payload);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${resendInvite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changeContactOrganizationRole(
    payload: InputChangeOrganizationContactRoleType,
  ): Promise<CustomIdentityResultType | undefined> {
    loading.value = true;

    try {
      return await changeOrganizationContactRole(payload);
    } catch (e) {
      Logger.error(`${useOrganizationContacts.name}.${changeContactOrganizationRole.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    sort,
    itemsPerPage,
    page,
    keyword,
    filter,
    roleIds,
    statuses,
    fetchContacts,
    lockContact,
    unlockContact,
    removeMemberFromOrganization,
    revokeInvite,
    resendInvite,
    changeContactOrganizationRole,
    pages: readonly(pages),
    loading: readonly(loading),
    contacts: computed(() => contacts.value),
  };
}
