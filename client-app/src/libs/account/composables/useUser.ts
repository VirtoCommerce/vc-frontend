import { Ref, ref, computed } from "@vue/composition-api";
import { getMe } from "@core/api/graphql/account";
import { UserType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

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
const loading: Ref<boolean> = ref(true);

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


  return {
    me: computed(() => me.value),
    loading: computed(() => loading.value),
    updateUser,
    changePassword,
    loadMe
  };
};
