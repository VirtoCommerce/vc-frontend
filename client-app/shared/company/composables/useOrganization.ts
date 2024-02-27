import { readonly, ref } from "vue";
import { updateOrganization as _updateOrganization } from "@/core/api/graphql/organization";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { InputUpdateOrganizationType } from "@/core/api/graphql/types";

export function useOrganization() {
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

    await fetchUser({ withBroadcast: true });
  }

  return {
    updateOrganization,
    loading: readonly(loading),
  };
}
