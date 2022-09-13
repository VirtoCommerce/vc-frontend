import { createContact, createUser, requestPasswordReset } from "@/xapi/graphql/account";
import { getOrganizationContacts } from "@/xapi/graphql/organization";
import { ContactType, IdentityResultType, InputUpdateContactType } from "@/xapi/types";
import { ref, shallowRef, readonly, computed } from "vue";
import { getSortingExpression, Logger } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { DEFAULT_PAGE_SIZE, SORT_ASCENDING } from "@/core/constants";
import _ from "lodash";
import { ISortInfo } from "@/core/types";
import { useI18n } from "vue-i18n";
import {
  AddNewMember,
  convertToExtendedContact,
  convertToInputUpdateContact,
  ExtendedContactType,
} from "@/shared/company";
import globals from "@/core/globals";
import { useRouter } from "vue-router";
import updateContact from "@/xapi/graphql/account/mutations/updateContact";

const TEMP_PASSWORD = "TempPassword#1";

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

  const router = useRouter();
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
      Logger.error(`${useOrganizationContacts.name}.${addNewContact.name}`, e);
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
    addNewContact,
    updateMember,
  };
}
