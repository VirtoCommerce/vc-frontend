import { onMounted, ref } from "vue";
import { getAssignableCompanyRoles } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import type { RoleType } from "@/core/api/graphql/types";

type AssignableRoleType = Pick<RoleType, "id" | "name">;

// On failure this deliberately does not fall back to the raw whitelist setting (useCompanyMemberRoles):
// that would silently reintroduce roles that don't resolve to a real one on the platform.
export function useAssignableCompanyRoles(organizationId: string) {
  const roles = ref<AssignableRoleType[]>([]);
  const loading = ref(true);

  onMounted(async () => {
    try {
      roles.value = await getAssignableCompanyRoles(organizationId);
    } catch (e) {
      Logger.error(`${useAssignableCompanyRoles.name}`, e);
    } finally {
      loading.value = false;
    }
  });

  return { roles, loading };
}
