import { eagerComputed } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getMe,
  inviteUser as _inviteUser,
  registerAccount,
  registerByInvitation,
  requestPasswordReset,
  resetPasswordByToken,
  updatePersonalData,
  changePassword as _changePassword,
  sendVerifyEmail as _sendVerifyEmail,
  confirmEmailByToken,
} from "@/core/api/graphql/account";
import { useFetch } from "@/core/composables";
import { PASSWORD_EXPIRY_IN_DAYS } from "@/core/constants";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { TabsType, pageReloadEvent, useBroadcast, userBlockedEvent, userReloadEvent } from "@/shared/broadcast";
import { usePopup } from "@/shared/popup";
import PasswordExpirationModal from "../components/password-expiration-modal.vue";
import type {
  AccountCreationResultType,
  CustomIdentityResultType,
  IdentityResultType,
  InputConfirmEmailType,
  InputInviteUserType,
  InputRegisterByInvitationType,
  Organization,
  UserType,
} from "@/core/api/graphql/types";
import type {
  ForgotPassword,
  RegisterOrganization,
  ResetPassword,
  ChangePassword,
  SignMeIn,
  SignMeUp,
  UserPersonalData,
} from "@/shared/account";

const loading = ref(false);
const user = ref<UserType>();

const isAuthenticated = computed<boolean>(() => !!user.value?.userName && user.value.userName !== "Anonymous");
const isCorporateMember = computed<boolean>(() => !!user.value?.contact?.organizationId);
const organization = eagerComputed<Organization | null>(() => user.value?.contact?.organizations?.items?.[0] ?? null);
const operator = computed<UserType | null>(() => user.value?.operator ?? null);

export function useUser() {
  const route = useRoute();
  const router = useRouter();
  const broadcast = useBroadcast();
  const { innerFetch } = useFetch();
  const { openPopup } = usePopup();

  function handlePasswordExpiration(): void {
    //if (user.value.passwordExpiryInDays && user.value.passwordExpiryInDays <= PASSWORD_EXPIRY_IN_DAYS) {
    openPopup({
      component: PasswordExpirationModal,

      props: {
        onConfirm(): void {
          router.replace({ name: "ChangePassword" });
        },

        onDismiss(): void {
          console.log();
        },
      },
    });
    //}
  }

  function checkPermissions(...permissions: string[]): boolean {
    let access = !!user.value?.isAdministrator;

    if (!access) {
      access = permissions.every((permission) => user.value?.permissions?.includes(permission));
    }

    return access;
  }

  async function fetchUser(options: { withBroadcast?: boolean } = {}) {
    const { withBroadcast = false } = options;

    try {
      loading.value = true;

      user.value = await getMe();

      if (!route.meta.public) {
        handlePasswordExpiration();
      }

      if (withBroadcast) {
        broadcast.emit(userReloadEvent);
      }

      const { hash, pathname, search } = location;

      if ((user.value?.forcePasswordChange || user.value?.passwordExpired) && pathname !== "/change-password") {
        location.href = `/change-password?returnUrl=${pathname + search + hash}`;
      }

      if (user.value?.lockedState) {
        await signMeOut({ reloadPage: false });

        broadcast.emit(userBlockedEvent, undefined, TabsType.ALL);
      }
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
        await fetchUser({ withBroadcast: true });
      }

      return result;
    } catch (e) {
      Logger.error(`${useUser.name}.${updatePersonalData.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function confirmEmail(payload: InputConfirmEmailType): Promise<CustomIdentityResultType> {
    loading.value = true;

    try {
      return await confirmEmailByToken(payload);
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

      const result = await innerFetch<IdentityResultType, SignMeIn>("/storefrontapi/account/login", "POST", payload);

      if (result.succeeded) {
        broadcast.emit(pageReloadEvent);
      }

      return result;
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

  async function signMeOut(options: { reloadPage?: boolean } = { reloadPage: true }): Promise<void> {
    try {
      loading.value = true;
      await innerFetch("/storefrontapi/account/logout");
      if (options.reloadPage) {
        broadcast.emit(pageReloadEvent, undefined, TabsType.ALL);
      }
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
  async function changePassword(payload: ChangePassword): Promise<IdentityResultType> {
    try {
      loading.value = true;

      return await _changePassword({
        userId: payload.userId,
        oldPassword: payload.oldPassword,
        newPassword: payload.newPassword,
      });
    } catch (e) {
      Logger.error(`${useUser.name}.${resetPassword.name}`, e);
      return { succeeded: false };
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

  async function sendVerifyEmail(userId: string): Promise<boolean | undefined> {
    loading.value = true;

    try {
      return await _sendVerifyEmail(userId);
    } catch (e) {
      Logger.error(`${useUser.name}.${sendVerifyEmail.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    isAuthenticated,
    isCorporateMember,
    organization,
    operator,
    checkPermissions,
    fetchUser,
    updateUser,
    confirmEmail,
    signMeIn,
    registerUser,
    registerOrganization,
    signMeOut,
    forgotPassword,
    resetPassword,
    inviteUser,
    registerByInvite,
    changePassword,
    sendVerifyEmail,
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
