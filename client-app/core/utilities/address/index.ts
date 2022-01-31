import { AnyAddressType } from "@core/types";
import { InputMemberAddressType, MemberAddressType } from "@core/api/graphql/types";
import { clone } from "lodash";

export function toInputAddress(address: AnyAddressType): InputMemberAddressType {
  const newAddress = clone(address) as Record<keyof MemberAddressType, any>;

  newAddress.key = newAddress.id;

  delete newAddress.id;
  delete newAddress.isDefault;

  return newAddress;
}

export function getAddressName(address: AnyAddressType): string {
  const { countryCode, regionName, city, line1 } = address;
  return [countryCode, regionName, city, line1].filter(Boolean).join(", ");
}
