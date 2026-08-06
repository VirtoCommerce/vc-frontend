import { onMounted, ref } from "vue";
import { getOrganizationContactRoles } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import type { RoleType } from "@/core/api/graphql/types";

export function useOrganizationContactRoles(organizationId: string) {
  const contactRoles = ref<RoleType[]>([]);
  const loading = ref(false);

  onMounted(async () => {
    loading.value = true;

    try {
      contactRoles.value = await getOrganizationContactRoles(organizationId);
    } catch (e) {
      Logger.error(`${useOrganizationContactRoles.name}`, e);
    } finally {
      loading.value = false;
    }
  });

  return { contactRoles, loading };
}
