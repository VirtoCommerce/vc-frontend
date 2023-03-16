import { eagerComputed } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import { useFetch } from "@/core/composables";
import globals from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  getMe,
  inviteUser as _inviteUser,
  registerAccount,
  registerByInvitation,
  requestPasswordReset,
  resetPasswordByToken,
  updatePersonalData,
} from "@/xapi/graphql/account";
import type {
  ForgotPassword,
  RegisterOrganization,
  ResetPassword,
  SignMeIn,
  SignMeUp,
  UserPersonalData,
} from "@/shared/account";
import type {
  AccountCreationResultType,
  CustomIdentityResultType,
  IdentityResultType,
  InputInviteUserType,
  InputRegisterByInvitationType,
  Organization,
  UserType,
} from "@/xapi/types";

const loading = ref(false);
const user = ref<UserType>();

const isAuthenticated = eagerComputed<boolean>(() => !!user.value?.userName && user.value.userName !== "Anonymous");
const organization = eagerComputed<Organization | null>(() => user.value?.contact?.organizations?.items?.[0] ?? null);
const operator = computed<UserType | null>(() => user.value?.operator ?? null);

export default function useUser() {
  const { innerFetch } = useFetch();

  function checkPermissions(...permissions: string[]): boolean {
    let access = !!user.value?.isAdministrator;

    if (!access) {
      access = permissions.every((permission) => user.value?.permissions?.includes(permission));
    }

    return access;
  }

  async function fetchUser() {
    try {
      loading.value = true;
      user.value = await getMe();
    } catch (e) {
      Logger.error(`${useUser.name}.${fetchUser.name}`, e);
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
      Logger.error(`${useUser.name}.${updatePersonalData.name}`, e);
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
      Logger.error(`${useUser.name}.${changePassword.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function confirmEmail(payload: { userId: string; token: string }): Promise<IdentityResultType> {
    try {
      loading.value = true;
      return await innerFetch<IdentityResultType>("/storefrontapi/account/confirmemail", "POST", payload);
    } catch (e) {
      Logger.error(`${useUser.name}.${confirmEmail.name}`, e);
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
      Logger.error(`${useUser.name}.${signMeIn.name}`, e);
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
      Logger.error(`${useUser.name}.${registerUser.name}`, e);
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
      Logger.error(`${useUser.name}.${registerOrganization.name}`, e);
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
      Logger.error(`${useUser.name}.${signMeOut.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(payload: ForgotPassword): Promise<boolean> {
    try {
      loading.value = true;

      return await requestPasswordReset({
        loginOrEmail: payload.email,
        urlSuffix: payload.resetPasswordUrlPath,
      });
    } catch (e) {
      Logger.error(`${useUser.name}.${forgotPassword.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(payload: ResetPassword): Promise<IdentityResultType> {
    try {
      loading.value = true;

      return await resetPasswordByToken({
        userId: payload.userId,
        token: payload.token,
        newPassword: payload.password,
      });
    } catch (e) {
      Logger.error(`${useUser.name}.${resetPassword.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function inviteUser(payload: InputInviteUserType): Promise<CustomIdentityResultType> {
    try {
      return await _inviteUser(payload);
    } catch (e) {
      Logger.error(`${useUser.name}.${inviteUser.name}`, e);
      throw e;
    }
  }

  async function registerByInvite(payload: InputRegisterByInvitationType): Promise<CustomIdentityResultType> {
    loading.value = true;

    try {
      return await registerByInvitation(payload);
    } catch (e) {
      Logger.error(`${useUser.name}.${registerByInvite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    isAuthenticated,
    organization,
    operator,
    checkPermissions,
    fetchUser,
    updateUser,
    changePassword,
    confirmEmail,
    signMeIn,
    registerUser,
    registerOrganization,
    signMeOut,
    forgotPassword,
    resetPassword,
    inviteUser,
    registerByInvite,
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
}
