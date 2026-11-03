import type { MemberAddressType } from "@/core/api/graphql/types";

/**
 * The `AddressForm` inputs that show a message under them, by field name, e.g. for a rejected save. The description
 * input has no message, so it is not listed.
 */
export const ADDRESS_FORM_FIELD_NAMES: readonly (keyof MemberAddressType)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "countryCode",
  "postalCode",
  "regionId",
  "city",
  "line1",
  "line2",
];
