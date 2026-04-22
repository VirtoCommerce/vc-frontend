import type { CartConfigurationItemType } from "@/core/api/graphql/types";

export type LocalConfigurationItemType = Pick<
  CartConfigurationItemType,
  "id" | "sectionId" | "type" | "productId" | "quantity" | "customText"
>;

export type LocalConfigurationType = {
  localId: string;
  configuration: LocalConfigurationItemType[];
};
