import { readonly, ref } from "vue";
import { Logger } from "@/core/utilities";
import { InputUpdateOrganizationType } from "@/xapi/types";
import { updateOrganization as _updateOrganization } from "@/xapi/graphql/organization";
import { useUser } from "@/shared/account";

export default function useOrganization() {
  const loading = ref(false);

  const { fetchUser } = useUser();

  async function updateOrganization(payload: InputUpdateOrganizationType) {
    try {
      loading.value = true;
      await _updateOrganization(payload);
    } catch (e) {
      Logger.error(`${useOrganization.name}.${updateOrganization.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    await fetchUser();
  }

  return {
    updateOrganization,
    loading: readonly(loading),
  };
}
