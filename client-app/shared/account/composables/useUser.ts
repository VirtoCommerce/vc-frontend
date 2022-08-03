import { AccountCreationResultType, IdentityResultType, Organization, UserType } from "@/xapi/types";
import { computed, readonly, ref } from "vue";
import { eagerComputed } from "@vueuse/core";
import {
  getMe,
  registerAccount,
  requestPasswordReset,
  resetPasswordByToken,
  updatePersonalData,
} from "@/xapi/graphql/account";

import { Logger } from "@/core/utilities";
import { useFetch } from "@/core/composables";
import {
  ForgotPassword,
  RegisterOrganization,
  ResetPassword,
  SignMeIn,
  SignMeUp,
  UserPersonalData,
} from "@/shared/account";
import globals from "@/core/globals";

const loading = ref(false);
const user = ref<UserType>();

const isAuthenticated = eagerComputed<boolean>(() => !!user.value?.userName && user.value.userName !== "Anonymous");
const organization = eagerComputed<Organization | null>(() => user.value?.contact?.organizations?.items?.[0] ?? null);

export default () => {
  const { innerFetch } = useFetch();

  async function fetchUser() {
    try {
      user.value = await getMe();
    } catch (e) {
      Logger.error(`useUser.${fetchUser.name}`, e);
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
      Logger.error(`useUser.${updatePersonalData.name}`, e);
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
      Logger.error(`useUser.${changePassword.name}`, e);
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

      if (res.succeeded) {
        await fetchUser();
      }

      return res;
    } catch (e) {
      Logger.error(`useUser.${signMeIn.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerUser(payload: SignMeUp): Promise<AccountCreationResultType> {
    const { storeId } = globals;

    try {
      loading.value = true;

      const resultData = await registerAccount({
        storeId,
        account: {
          username: payload.userName,
          password: payload.password,
          email: payload.email,
        },
        contact: {
          firstName: payload.firstName,
          lastName: payload.lastName,
        },
      });

      return resultData.result!;
    } catch (e) {
      Logger.error(`useUser.${registerUser.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerOrganization(payload: RegisterOrganization): Promise<AccountCreationResultType> {
    const { storeId } = globals;

    try {
      loading.value = true;

      const resultData = await registerAccount({
        storeId,
        account: {
          username: payload.userName,
          password: payload.password,
          email: payload.email,
        },
        contact: {
          firstName: payload.firstName as string,
          lastName: payload.lastName as string,
        },
        organization: {
          name: payload.organizationName as string,
        },
      });

      return resultData.result!;
    } catch (e) {
      Logger.error(`useUser.${registerOrganization.name}`, e);
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
      Logger.error(`useUser.${signMeOut.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(payload: ForgotPassword): Promise<boolean> {
    try {
      loading.value = true;

      const success = await requestPasswordReset({
        loginOrEmail: payload.email,
        urlSuffix: payload.resetPasswordUrl,
      });

      return success;
    } catch (e) {
      Logger.error(`useUser.${forgotPassword.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(payload: ResetPassword): Promise<IdentityResultType> {
    try {
      loading.value = true;

      const result = await resetPasswordByToken({
        userId: payload.userId,
        token: payload.token,
        newPassword: payload.password,
      });

      return result;
    } catch (e) {
      Logger.error(`useUser.${resetPassword.name}`, e);
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
    resetPassword,
    loading: readonly(loading),
    user: computed({
      get() {
        if (!user.value) {
          throw new Error("User is missing.");
        }

        return user.value!;
      },

      set() {
        throw new Error("User change is not available.");
      },
    }),
  };
};
