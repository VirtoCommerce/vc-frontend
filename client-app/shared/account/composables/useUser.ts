import { themeContext } from "@core/utilities/context/index";
import { Ref, ref, computed } from "vue";
import { getMe, updatePersonalData, createUser, createOrganization, createContact } from "@/core/api/graphql/account";
import { UserType, IdentityResultType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";
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

const me: Ref<UserType> = ref({
  userName: "",
  phoneNumberConfirmed: false,
  twoFactorEnabled: false,
  securityStamp: "",
  passwordExpired: false,
  id: "",
  accessFailedCount: 0,
  emailConfirmed: false,
  isAdministrator: false,
  lockoutEnabled: false,
});

const loading: Ref<boolean> = ref(false);

export default () => {
  const { innerFetch } = useFetch();

  async function loadMe() {
    loading.value = true;

    try {
      me.value = await getMe();
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
      });
      const res = (await response.json()) as IdentityResultType;

      return res;
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
      const res = await innerFetch<SignMeIn, IdentityResultType>(url, "POST", payload);

      if (res.succeeded) {
        await loadMe();
      }

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
      const result = await createUser({
        userName: payload.userName,
        password: payload.password,
        email: payload.email,
        memberId: contact.id,
        userType: "Customer",
        storeId: themeContext.storeId as string,
      });
      return result;
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
      const organization = await createOrganization({
        name: payload.organizationName,
      });
      const contact = await createContact({
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        name: `${payload.firstName} ${payload.lastName}`,
        emails: [payload.email],
        organizations: [organization.id],
      });
      const result = await createUser({
        userName: payload.userName,
        password: payload.password,
        email: payload.email,
        memberId: contact.id,
        userType: "Customer",
        storeId: themeContext.storeId as string,
      });
      return result;
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

      await innerFetch<null, null>(url, "GET");

      await loadMe();
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
      const res = await innerFetch<ForgotPassword, IdentityResultType>(url, "POST", payload);
      return res;
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
      const res = await innerFetch<ValidateToken, IdentityResultType>(url, "POST", payload);
      return res;
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
      const res = await innerFetch<ResetPassword, IdentityResultType>(url, "POST", payload);
      return res;
    } catch (e) {
      Logger.error("useUser.resetPassword", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    me: computed(() => me.value),
    loading: computed(() => loading.value),
    isAuthenticated: computed(() => me.value && me.value.userName && me.value.userName !== "Anonymous"),
    organization: computed(() => {
      const orgs = me.value?.contact?.organizations?.items;
      return orgs && orgs.length ? orgs[0] : null;
    }),
    updateUser,
    changePassword,
    loadMe,
    signMeIn,
    registerUser,
    registerOrganization,
    signMeOut,
    forgotPassword,
    validateToken,
    resetPassword,
  };
};
