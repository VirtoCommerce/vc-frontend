import { Ref, ref, computed } from "@vue/composition-api";
import { baseUrl } from 'core/constants';
import { getMe } from "@core/api/graphql/account";
import { UserType } from "@core/api/graphql/types";
import axios from '@core/services/axios-instance';
import { Logger } from "@core/utilities";
import { SignMeUp, SignMeIn, IdentityResult } from '../types';

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
  contact: {
    id: '',
    firstName: '',
    lastName: '',
    fullName: '',
    memberType: '',
    organizationsIds: [],
    phones: []
  }
});
const loading: Ref<boolean> = ref(false);

export default () => {

  async function loadMe(): Promise<void>  {
    loading.value = true;
    try {
      me.value = await getMe();
      console.log(me);
    } catch (e) {
      Logger.error("useUser.loadMe", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(user: UserType): Promise<void>  {
    console.log("updateUser", user, me);
  }
  async function changePassword(): Promise<void>  {
    console.log("changePassword");
  }

  async function signMeIn(signMeIn: SignMeIn): Promise<IdentityResult>  {
    console.log("login", signMeIn);
    try {
      const res = await axios.post(`${baseUrl}/storefrontapi/account/login`, signMeIn);
      return res?.data as IdentityResult;
    } catch (e) {
      Logger.error("useUser.signMeIn", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function signMeUp(signMeUp: SignMeUp): Promise<IdentityResult> {
    console.log("login", signMeUp);
    try {
      const res = await axios.post(`${baseUrl}/storefrontapi/account/user`, signMeUp);
      return res?.data as IdentityResult;
    } catch (e) {
      Logger.error("useUser.signMeUp", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }



  return {
    me: computed(() => me.value),
    loading: computed(() => loading.value),
    updateUser,
    changePassword,
    loadMe,
    signMeIn,
    signMeUp
  };
};
