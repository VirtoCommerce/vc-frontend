import getOrganizationContacts from "@/xapi/graphql/account/queries/getOrganizationContacts";
import { ContactType, UserType } from "@/xapi/types";
import { ref, shallowRef, Ref, readonly, computed } from "vue";
import { Logger } from "@/core/utilities";
import { ISortInfo } from "../types";
import { XapiContactStatus, DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import { getSortingExpression } from "../utils";
import useUser from "./useUser";
import _ from "lodash";
import { OrganizationContactDisplayStatusType, OrganizationContactType } from "@/core/types";
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
      contacts.value = _.map(response.items, (item: ContactType) => {
        const contactFullName: string = getFullName(item);
        return {
          ...item,
          fullName: !item.status ? t("pages.company.members.invite_sent") : contactFullName,
          email: getEmailAddress(item),
          role: getRoleName(item),
          displayStatus: getDisplayContactStatus(item.status),
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

function getEmailAddress(contact: ContactType): string | undefined {
  let email: string | undefined;
  if (contact.emails && contact.emails.length) {
    email = contact.emails[0];
  }
  if (!email && contact.securityAccounts && contact.securityAccounts.length) {
    email = contact.securityAccounts[0].email;
  }
  return email;
}

function getFullName(contact: ContactType): string {
  return contact.fullName || contact.name || `${contact.firstName} ${contact.lastName}`;
}

function getSearchPhrase(keyword: string): string {
  return keyword ? `"${keyword}"` : "";
}

function getRoleName(contact: ContactType): string | undefined {
  let roleName: string | undefined;
  if (contact.securityAccounts && contact.securityAccounts.length) {
    const securityAccount: UserType = contact.securityAccounts[0];
    if (securityAccount.roles && securityAccount.roles.length) {
      roleName = securityAccount.roles[0].normalizedName;
    }
  }
  return roleName;
}

function getDisplayContactStatus(xapiStatus?: string): OrganizationContactDisplayStatusType {
  switch (xapiStatus) {
    case XapiContactStatus.Approved:
      return {
        localeLabel: "pages.company.members.statuses.active",
        iconUrl: "/static/icons/contact-active.svg",
        cssStyles: "bg-success-500 text-white",
      };
    case XapiContactStatus.Rejected:
      return {
        localeLabel: "pages.company.members.statuses.blocked",
        iconUrl: "/static/icons/contact-blocked.svg",
        cssStyles: "bg-error-600 text-white",
      };
    default:
      return {
        localeLabel: "pages.company.members.statuses.inactive",
        iconUrl: "/static/icons/contact-inactive.svg",
        cssStyles: "text-gray-500 border border-solid border-gray-500",
      };
  }
}
