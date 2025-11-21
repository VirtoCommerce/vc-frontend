import { eagerComputed, useLocalStorage } from "@vueuse/core";
import { createGlobalState } from "@vueuse/core";
import { remove } from "lodash";
import { computed, readonly, ref } from "vue";
import {
  getMe,
  inviteUser as _inviteUser,
  registerAccount,
  registerByInvitation,
  sendPasswordResetEmail,
  resetPasswordByToken,
  updatePersonalData,
  changePassword as _changePassword,
  sendVerifyEmail as _sendVerifyEmail,
  confirmEmailByToken,
  updateContact,
} from "@/core/api/graphql/account";
import { useAuth } from "@/core/composables/useAuth";
import { ORGANIZATION_MAINTAINER, USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  TabsType,
  useBroadcast,
  userLockedEvent,
  userReloadEvent,
  passwordExpiredEvent,
  pageReloadEvent,
} from "@/shared/broadcast";
import { useModal } from "@/shared/modal";
import PasswordExpirationModal from "../components/password-expiration-modal.vue";
import type { UserType } from "@/core/api/graphql/account/queries/getMe";
import type {
  AccountCreationResultType,
  CustomIdentityResultType,
  IdentityResultType,
  InputConfirmEmailType,
  InputInviteUserType,
  InputRegisterByInvitationType,
} from "@/core/api/graphql/types";
import type {
  ForgotPasswordType,
  RegisterOrganizationType,
  ResetPasswordType,
  ChangePasswordType,
  SignMeUpType,
  UserPersonalDataType,
} from "@/shared/account";

interface IPasswordExpirationEntry {
  userId: string;
  date: Date;
}

export function _useUser() {
  const loading = ref(false);
  const user = ref<UserType>();

  const isAuthenticated = computed<boolean>(() => !!user.value?.userName && user.value.userName !== "Anonymous");
  const isCorporateMember = computed<boolean>(() => !!user.value?.contact?.organizationId);
  const organization = eagerComputed(
    () =>
      user.value?.contact?.organizations?.items?.find((item) => item.id === user.value?.contact?.organizationId) ??
      null,
  );

  const allOrganizations = computed(() => user.value?.contact?.organizations?.items || []);

  const operator = computed(() => user.value?.operator ?? null);

  const broadcast = useBroadcast();
  const { refresh } = useAuth();
  const { openModal, closeModal } = useModal();
  const contactCultureName = computed(() => user.value?.contact?.defaultLanguage);

  const changePasswordReminderDates = useLocalStorage<IPasswordExpirationEntry[]>(
    "vcst-password-expire-reminder-date",
    [],
  );

  const savedUserId = useLocalStorage<string>(USER_ID_LOCAL_STORAGE, "");

  function handlePasswordExpiration(): void {
    if (!user.value?.passwordExpiryInDays) {
      return;
    }

    const userPasswordExpirationEntry = changePasswordReminderDates.value.find(
      (entry) => entry.userId === user.value!.id,
    );

    if (userPasswordExpirationEntry && new Date(userPasswordExpirationEntry.date) > new Date()) {
      return;
    }

    openModal({
      component: PasswordExpirationModal,

      props: {
        expiryInDays: user.value?.passwordExpiryInDays,

        async onConfirm(): Promise<void> {
          if (userPasswordExpirationEntry) {
            remove(changePasswordReminderDates.value, (entry) => entry.userId === userPasswordExpirationEntry.userId);
          }

          closeModal();

          await globals.router.replace({ name: "ChangePassword" });
        },

        onDismiss(): void {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 1);

          if (userPasswordExpirationEntry) {
            userPasswordExpirationEntry.date = nextDate;
          } else {
            changePasswordReminderDates.value.push({
              userId: user.value!.id,
              date: nextDate,
            });
          }

          closeModal();
        },
      },
    });
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

      const userData = await getMe(savedUserId.value);
      setUser(userData, { withBroadcast });
    } catch (e) {
      Logger.error(`${useUser.name}.${fetchUser.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setUser(userData: UserType, options: { withBroadcast?: boolean } = {}) {
    const { withBroadcast = false } = options;

    user.value = userData;

    if (user.value && user.value.id !== savedUserId.value) {
      savedUserId.value = user.value.id;
    }

    handlePasswordExpiration();

    if (withBroadcast) {
      void broadcast.emit(userReloadEvent);
    }

    if (user.value?.forcePasswordChange || user.value?.passwordExpired) {
      void broadcast.emit(passwordExpiredEvent);
    }

    if (user.value?.lockedState) {
      void broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
    }
  }

  async function updateUser(personalData: UserPersonalDataType): Promise<void> {
    if (!user.value?.contact) {
      return;
    }

    try {
      loading.value = true;

      await updateContact({
        ...personalData,
        selectedAddressId: user.value.contact.selectedAddressId,
        id: user.value.contact.id,
      });

      await fetchUser({ withBroadcast: true });
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

  async function registerUser(payload: SignMeUpType): Promise<AccountCreationResultType> {
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

  async function registerOrganization(payload: RegisterOrganizationType): Promise<AccountCreationResultType> {
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

  async function forgotPassword(payload: ForgotPasswordType): Promise<boolean> {
    try {
      loading.value = true;

      const data = await sendPasswordResetEmail({
        loginOrEmail: payload.email,
        urlSuffix: payload.resetPasswordUrlPath,
      });

      return data ?? false;
    } catch (e) {
      Logger.error(`${useUser.name}.${forgotPassword.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(payload: ResetPasswordType): Promise<IdentityResultType> {
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
  async function changePassword(payload: ChangePasswordType): Promise<IdentityResultType> {
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

  async function switchOrganization(organizationId: string): Promise<void> {
    loading.value = true;

    try {
      await refresh(organizationId);

      localStorage.setItem(`organization-id-${user.value?.userName}`, organizationId);

      void broadcast.emit(pageReloadEvent, null, TabsType.ALL);
    } catch (e) {
      Logger.error(switchOrganization.name, e);
    } finally {
      loading.value = false;
    }
  }

  return {
    isAuthenticated,
    isCorporateMember,
    isMultiOrganization: computed(
      () => user.value?.contact?.organizations?.items && user.value?.contact?.organizations?.items?.length > 1,
    ),
    isOrganizationMaintainer: computed(
      () =>
        user.value?.roles?.some((role) => role.name.toLowerCase() === ORGANIZATION_MAINTAINER.name.toLowerCase()) ??
        false,
    ),
    organization,
    allOrganizations,
    operator,
    checkPermissions,
    fetchUser,
    updateUser,
    confirmEmail,
    registerUser,
    registerOrganization,
    forgotPassword,
    resetPassword,
    inviteUser,
    registerByInvite,
    changePassword,
    sendVerifyEmail,
    switchOrganization,
    loading: readonly(loading),
    savedUserId: readonly(savedUserId),
    setUser,
    user: computed({
      get() {
        if (!user.value) {
          throw new Error("User is missing.");
        }

        return user.value;
      },

      set() {
        throw new Error("User change is not available.");
      },
    }),
    contactCultureName,
  };
}

export const useUser = createGlobalState(_useUser);
