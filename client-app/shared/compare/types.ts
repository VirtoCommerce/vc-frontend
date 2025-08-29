import type { ConfigurationSectionInput } from "@/core/api/graphql/types";

export interface IConfigurationProperty {
  label: string;
  value: string;
}

export interface IConfigProductToCompare {
  id: string;
  productId: string;
  configurationSectionInput?: ConfigurationSectionInput[];
  properties: IConfigurationProperty[];
}
