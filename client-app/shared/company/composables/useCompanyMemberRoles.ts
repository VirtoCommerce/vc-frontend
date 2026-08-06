import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { ALL_ROLES } from "@/core/constants";
import type { ExtendedRoleType } from "@/core/types/role";

const CUSTOMER_MODULE_ID = "VirtoCommerce.Customer";
const COMPANY_MEMBER_ROLES_SETTING = "Customer.MembershipRolesWhitelist";

function toRole(id: string, t: ReturnType<typeof useI18n>["t"]): ExtendedRoleType {
  const idLower = id.toLowerCase();
  const knownRole = ALL_ROLES.find((role) => role.id.toLowerCase() === idLower || role.name.toLowerCase() === idLower);

  if (knownRole) {
    return knownRole;
  }

  return { id, name: t(`common.roles.${id}`, id) };
}

export function useCompanyMemberRoles() {
  const { t } = useI18n();
  const { getSettingValue } = useModuleSettings(CUSTOMER_MODULE_ID);
  const roles = computed<ExtendedRoleType[]>(() => {
    const rawValue = getSettingValue(COMPANY_MEMBER_ROLES_SETTING);

    if (typeof rawValue === "string" && rawValue.length) {
      try {
        const roleIds = JSON.parse(rawValue) as unknown;
        if (Array.isArray(roleIds) && roleIds.every((id) => typeof id === "string")) {
          return roleIds.map((id) => toRole(id, t));
        }
      } catch {
        // fall through to the default list below
      }
    }

    return ALL_ROLES;
  });

  return { roles };
}
