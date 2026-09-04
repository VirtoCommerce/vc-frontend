import { onMounted, ref } from "vue";
import { getOrganizationContactRoles } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import { useCompanyMemberRoles } from "@/shared/company/composables/useCompanyMemberRoles";
import type { RoleType } from "@/core/api/graphql/types";

type ContactRoleType = Pick<RoleType, "id" | "name">;

export function useOrganizationContactRoles(organizationId: string) {
  const { roles: companyMemberRoles } = useCompanyMemberRoles();
  const contactRoles = ref<ContactRoleType[]>([]);

  onMounted(async () => {
    try {
      contactRoles.value = await getOrganizationContactRoles(organizationId);
    } catch (e) {
      Logger.error(`${useOrganizationContactRoles.name}`, e);
      contactRoles.value = companyMemberRoles.value;
    }
  });

  return { contactRoles };
}
