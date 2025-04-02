import { ref, readonly } from "vue";
import { changeOrganizationLogo } from "@/core/api/graphql/organization";
import { Logger } from "@/core/utilities";

export function useOrganizationLogo() {
  const loading = ref(false);

  async function updateLogo(organizationId: string, logoUrl?: string) {
    if (logoUrl === undefined) {
      return;
    }

    loading.value = true;

    try {
      await changeOrganizationLogo(organizationId, logoUrl);
    } catch (e) {
      Logger.error("updateOrganizationLogo.updateLogo", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    updateLogo,
    loading: readonly(loading),
  };
}
