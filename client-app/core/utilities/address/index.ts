import { AnyAddressType } from "@core/types";
import { InputMemberAddressType, MemberAddressType } from "@core/api/graphql/types";
import _ from "lodash";

export function toInputAddress(address: AnyAddressType): InputMemberAddressType {
  const newAddress = _.clone(address) as Record<keyof MemberAddressType, any>;

  newAddress.key = newAddress.id;

  delete newAddress.id;
  delete newAddress.isDefault;

  return newAddress;
}

export function getAddressName(address: AnyAddressType): string {
  const { countryCode, regionName, city, line1 } = address;
  return [countryCode, regionName, city, line1].filter(Boolean).join(", ");
}

export function isEqualAddresses(address1: AnyAddressType, address2: AnyAddressType): boolean {
  const first = _.omit(address1, ["id", "zip", "isDefault"]);
  const second = _.omit(address2, ["id", "zip", "isDefault"]);
  return _.isEqual(first, second);
}
