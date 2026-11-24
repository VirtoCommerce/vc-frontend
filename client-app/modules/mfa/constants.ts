export const MODULE_NAME = "mfa";

export const MODULE_ID = "VirtoCommerce.MFA";

/**
 * The first release with the `mfa` xAPI schema in each release line: the hotfix line 3.1000 got it in 3.1000.2,
 * 3.1001 never did, and every line from 3.1002 has it. Older releases have the module but not the schema.
 */
export const SCHEMA_RELEASES = ["3.1000.2", "3.1002.0"] as const;

/** Registered by the MFA module; lets an organization maintainer turn MFA on or off for the whole organization. */
export const MFA_PERMISSIONS = {
  manageOrganizationMfa: "xapi:my_organization:mfa:manage",
} as const;

export const MFA_STORE_MODES = {
  // the value of the store setting, with spaces
  useGlobalSetting: "Use global setting",
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

export const MFA_REQUIRED_BY = {
  none: "None",
  global: "Global",
  store: "Store",
  organization: "Organization",
  user: "User",
} as const;
