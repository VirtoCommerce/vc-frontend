import { Ref, ref, readonly } from "vue";
import { eagerComputed } from "@vueuse/core";
import { getMe, updatePersonalData, createUser, createOrganization, createContact } from "@/core/api/graphql/account";
import { UserType, IdentityResultType, Organization } from "@core/api/graphql/types";
import { Logger, themeContext } from "@core/utilities";
import {
  RegisterOrganization,
  SignMeUp,
  SignMeIn,
  ForgotPassword,
  ValidateToken,
  ResetPassword,
  UserPersonalData,
} from "@/shared/account";
import useFetch from "@/core/composables/useFetch";

const me: Ref<UserType | null> = ref(null);

const loading: Ref<boolean> = ref(false);

const isAuthenticated = eagerComputed<boolean>(() => !!me.value?.userName && me.value.userName !== "Anonymous");
const organization = eagerComputed<Organization | null>(() => me.value?.contact?.organizations?.items?.[0] ?? null);

async function loadMe() {
  try {
    const user = await getMe();
    me.value = user;
  } catch (e) {
    Logger.error("useUser.loadMe", e);
    throw e;
  } finally {
    loading.value = false;
  }
}

//Load user at first module import. Single request per app loading.
await loadMe();

export default () => {
  const { innerFetch } = useFetch();

  async function updateUser(personalData: UserPersonalData): Promise<IdentityResultType> {
    try {
      loading.value = true;
      const result = await updatePersonalData(personalData);
      if (result.succeeded) {
        await loadMe();
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
      const response = await fetch("/storefrontapi/account/password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword, newPasswordConfirm: newPassword }),
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json-patch+json",
        },
      });
      return (await response.json()) as IdentityResultType;
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
      const res = await innerFetch<IdentityResultType, SignMeIn>(url, "POST", payload);

      return res;
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
        storeId: themeContext.storeId as string,
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
        storeId: themeContext.storeId as string,
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
    me: readonly(me),
  };
};
