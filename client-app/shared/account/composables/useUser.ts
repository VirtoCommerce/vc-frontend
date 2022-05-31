import { computed, readonly, ref } from "vue";
import { eagerComputed } from "@vueuse/core";
import { createContact, createOrganization, createUser, getMe, updatePersonalData } from "@/core/api/graphql/account";
import { IdentityResultType, Organization, UserType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
import { useFetch } from "@core/composables";
import { storeId } from "@core/constants";
import {
  ForgotPassword,
  RegisterOrganization,
  ResetPassword,
  SignMeIn,
  SignMeUp,
  UserPersonalData,
  ValidateToken,
} from "@/shared/account";

const loading = ref(false);
const user = ref<UserType | null>(null);

const isAuthenticated = eagerComputed<boolean>(() => !!user.value?.userName && user.value.userName !== "Anonymous");
const organization = eagerComputed<Organization | null>(() => user.value?.contact?.organizations?.items?.[0] ?? null);

export default () => {
  const { innerFetch } = useFetch();

  async function fetchUser() {
    try {
      user.value = await getMe();
    } catch (e) {
      Logger.error("useUser.loadMe", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(personalData: UserPersonalData): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const result = await updatePersonalData(personalData);
      if (result.succeeded) {
        await fetchUser();
      }
      return result;
    } catch (e) {
      Logger.error("useUser.updatePersonalData", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(oldPassword: string, newPassword: string): Promise<IdentityResultType> {
    try {
      loading.value = true;

      return await innerFetch<IdentityResultType>("/storefrontapi/account/password", "POST", {
        oldPassword,
        newPassword,
        newPasswordConfirm: newPassword,
      });
    } catch (e) {
      Logger.error("useUser.changePassword", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function signMeIn(payload: SignMeIn): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const url = "/storefrontapi/account/login";
      return await innerFetch<IdentityResultType, SignMeIn>(url, "POST", payload);
    } catch (e) {
      Logger.error("useUser.signMeIn", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerUser(payload: SignMeUp): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const contact = await createContact({
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        name: `${payload.firstName} ${payload.lastName}`,
        emails: [payload.email],
      });
      return await createUser({
        userName: payload.userName,
        password: payload.password,
        email: payload.email,
        memberId: contact.id,
        userType: "Customer",
        storeId,
      });
    } catch (e) {
      Logger.error("useUser.registerUser", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerOrganization(payload: RegisterOrganization): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const createdOrganization = await createOrganization({
        name: payload.organizationName,
      });
      const contact = await createContact({
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        name: `${payload.firstName} ${payload.lastName}`,
        emails: [payload.email],
        organizations: [createdOrganization.id],
      });
      return await createUser({
        userName: payload.userName,
        password: payload.password,
        email: payload.email,
        memberId: contact.id,
        userType: "Customer",
        storeId,
      });
    } catch (e) {
      Logger.error("useUser.registerOrganization", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function signMeOut(): Promise<void> {
    try {
      loading.value = true;
      const url = "/storefrontapi/account/logout";
      await innerFetch(url);
    } catch (e) {
      Logger.error("useUser.logout", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(payload: ForgotPassword): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const url = "/storefrontapi/account/forgotPassword";
      return await innerFetch<IdentityResultType, ForgotPassword>(url, "POST", payload);
    } catch (e) {
      Logger.error("useUser.forgotPassword", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function validateToken(payload: ValidateToken): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const url = "/storefrontapi/account/validateToken";
      return await innerFetch<IdentityResultType, ValidateToken>(url, "POST", payload);
    } catch (e) {
      Logger.error("useUser.validateToken", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(payload: ResetPassword): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const url = "/storefrontapi/account/resetPassword";
      return await innerFetch<IdentityResultType, ResetPassword>(url, "POST", payload);
    } catch (e) {
      Logger.error("useUser.resetPassword", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    isAuthenticated,
    organization,
    fetchUser,
    updateUser,
    changePassword,
    signMeIn,
    registerUser,
    registerOrganization,
    signMeOut,
    forgotPassword,
    validateToken,
    resetPassword,
    loading: readonly(loading),
    me: computed(() => user.value!),
  };
};
