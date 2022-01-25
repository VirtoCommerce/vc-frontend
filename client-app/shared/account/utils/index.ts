import { InputMemberAddressType, MemberAddressType } from "@core/api/graphql/types";
import { ISortInfo } from "@/shared/account";

export function toInputAddress(address: MemberAddressType): InputMemberAddressType {
  // TODO: add converter logic

  return address as InputMemberAddressType;
}

export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}
