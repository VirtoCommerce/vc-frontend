export const MODULE_NAME = "mfa";

/** Registered by the MFA module; lets an organization maintainer turn MFA on or off for the whole organization. */
export const MFA_PERMISSIONS = {
  manageOrganizationMfa: "xapi:my_organization:mfa:manage",
} as const;

export const MFA_STORE_MODES = {
  useGlobalSetting: "UseGlobalSetting",
  enabled: "Enabled",
  disabled: "Disabled",
  adminManaged: "AdminManaged",
  customerChoice: "CustomerChoice",
} as const;

export const MFA_MODES = {
  off: "Off",
  enabled: "Enabled",
  required: "Required",
} as const;
