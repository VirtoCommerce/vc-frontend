import type { CartConfigurationItemType } from "@/core/api/graphql/types";

export type LocalConfigurationType = {
  localId: string;
  configuration: CartConfigurationItemType[];
};
