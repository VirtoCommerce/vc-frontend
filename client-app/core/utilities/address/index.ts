import clone from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import pick from "lodash/pick";
import type { AnyAddressType } from "../../types";
import type { InputMemberAddressType, MemberAddressType } from "@/core/api/graphql/types";

export function toInputAddress(address: AnyAddressType): InputMemberAddressType {
  const newAddress = clone(address);

  (newAddress as InputMemberAddressType).key = newAddress.id;

  delete newAddress.id;
  delete newAddress.isDefault;
  delete newAddress.isFavorite;

  return newAddress as InputMemberAddressType;
}

export function getAddressName(address: AnyAddressType): string {
  const { countryCode, regionName, city, line1 } = address;
  return [countryCode, regionName, city, line1].filter(Boolean).join(", ");
}

export function isEqualAddresses(
  address1: AnyAddressType,
  address2: AnyAddressType,
  options: { skipDescription?: boolean; omitFields?: (keyof MemberAddressType)[] } = {},
): boolean {
  const { skipDescription = true } = options;
  let verifiableProperties: Array<keyof MemberAddressType> = [
    "firstName",
    "lastName",
    "city",
    "line1",
    "line2",
    "countryCode",
    "regionId",
    "postalCode",
    "phone",
    "email",
  ];

  if (!skipDescription) {
    verifiableProperties.push("description");
  }

  if (options.omitFields) {
    verifiableProperties = verifiableProperties.filter((prop) => !options.omitFields?.includes(prop));
  }

  const first = pick(address1, verifiableProperties);
  const second = pick(address2, verifiableProperties);

  return isEqual(first, second);
}

export function isMemberAddressType(address: AnyAddressType): address is MemberAddressType {
  return typeof address === "object" && address !== null && "description" in address;
}
