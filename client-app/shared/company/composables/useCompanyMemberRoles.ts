import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { ALL_ROLES, ORGANIZATION_EMPLOYEE, ORGANIZATION_MAINTAINER, PURCHASING_AGENT } from "@/core/constants";
import type { ExtendedRoleType } from "@/core/types/role";

const CUSTOMER_MODULE_ID = "VirtoCommerce.Customer";
const COMPANY_MEMBER_ROLES_SETTING = "Customer.MembershipRolesWhitelist";

const DEFAULT_ROLES: ExtendedRoleType[] = [ORGANIZATION_EMPLOYEE, PURCHASING_AGENT, ORGANIZATION_MAINTAINER];

function toRole(
  id: string,
  t: ReturnType<typeof useI18n>["t"],
  te: ReturnType<typeof useI18n>["te"],
): ExtendedRoleType {
  const idLower = id.toLowerCase();
  const knownRole = ALL_ROLES.find((role) => role.id.toLowerCase() === idLower || role.name.toLowerCase() === idLower);

  if (knownRole) {
    return knownRole;
  }
  const translationKey = `common.roles.${id}`;
  return { id, name: te(translationKey) ? t(translationKey) : id };
}

function dedupeById(roles: ExtendedRoleType[]): ExtendedRoleType[] {
  const seenIds = new Set<string>();
  return roles.filter((role) => {
    if (seenIds.has(role.id)) {
      return false;
    }
    seenIds.add(role.id);
    return true;
  });
}

export function useCompanyMemberRoles() {
  const { t, te } = useI18n();
  const { getSettingValue } = useModuleSettings(CUSTOMER_MODULE_ID);
  const roles = computed<ExtendedRoleType[]>(() => {
    const rawValue = getSettingValue(COMPANY_MEMBER_ROLES_SETTING);

    if (typeof rawValue === "string" && rawValue.length) {
      try {
        const roleIds = JSON.parse(rawValue) as unknown;
        if (Array.isArray(roleIds) && roleIds.every((id) => typeof id === "string")) {
          return dedupeById(roleIds.map((id) => toRole(id, t, te)));
        }
      } catch {
        // fall through to the default list below
      }
    }

    return DEFAULT_ROLES;
  });

  return { roles };
}
