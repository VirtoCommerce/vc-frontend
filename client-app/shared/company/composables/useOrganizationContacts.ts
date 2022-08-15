import { createContact, createUser, requestPasswordReset } from "@/xapi/graphql/account";
import { getOrganizationContacts } from "@/xapi/graphql/organization";
import { ContactType, IdentityResultType, InputUpdateContactType } from "@/xapi/types";
import { ref, shallowRef, Ref, readonly, computed } from "vue";
import { getSortingExpression, Logger } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import _ from "lodash";
import { ISortInfo, OrganizationContactType } from "@/core/types";
import { useI18n } from "vue-i18n";
import { AddNewMember, convertToOrganizationContact, convertToInputUpdateContact } from "@/shared/company";
import globals from "@/core/globals";
import { useRouter } from "vue-router";
import updateContact from "@/xapi/graphql/account/mutations/updateContact";

const TEMP_PASSWORD = "TempPassword#1";

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

  const router = useRouter();
  const { t } = useI18n();
  const { organization } = useUser();

  async function loadContacts() {
    loading.value = true;

    const sortingExpression: string = getSortingExpression(sort.value);
    const organizationId: string | undefined = organization.value!.id;

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
      const contactFullNameFallback: string = t("pages.company.members.invite_sent");
      contacts.value = _.map(response.items, (item: ContactType) =>
        convertToOrganizationContact(item, contactFullNameFallback)
      );
    } catch (e) {
      Logger.error("useOrganizationContacts.loadContacts", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addNewContact(payload: AddNewMember): Promise<IdentityResultType> {
    try {
      const { storeId } = globals;

      const contact = await createContact({
        firstName: payload.firstName,
        lastName: payload.lastName,
        name: `${payload.firstName} ${payload.lastName}`,
        emails: [payload.email],
        organizations: [organization.value!.id],
      });

      const identityResult = await createUser({
        roles: [{ id: payload.role.id, name: payload.role.name, permissions: [] }],
        userName: payload.email,
        password: TEMP_PASSWORD,
        email: payload.email,
        memberId: contact.id,
        userType: "Customer",
        storeId,
      });

      if (identityResult.succeeded) {
        await requestPasswordReset({
          loginOrEmail: payload.email,
          urlSuffix: router.resolve({ name: "SetPassword" }).path,
        });
      }

      return identityResult;
    } catch (e) {
      Logger.error(`useOrganizationContacts.${addNewContact.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateMember(contact: OrganizationContactType): Promise<void> {
    loading.value = true;

    try {
      const payload: InputUpdateContactType = convertToInputUpdateContact(contact);
      await updateContact(payload);
    } catch (e) {
      Logger.error(`useOrganizationContacts.${updateMember.name}`, e);
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
    addNewContact,
    updateMember,
  };
};

function getSearchPhrase(keyword: string): string {
  return keyword ? `"${keyword}"` : "";
}
