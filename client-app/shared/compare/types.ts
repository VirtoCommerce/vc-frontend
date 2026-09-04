import type { ConfigurationSectionInput, Product } from "@/core/api/graphql/types";

export interface IConfigurationProperty {
  label: string;
  value: string;
}

export interface ICompareProductEntry {
  productId: string;
  categoryKey: string;
  /** Present only for a configured product — distinguishes different configurations of the same product. */
  localId?: string;
  configurationSectionInput?: ConfigurationSectionInput[];
  properties?: IConfigurationProperty[];
}

// Products fetched by GraphQL are deduped by id, but the same product can be in the compare list
// several times with different configurations (each its own entry, distinguished by localId) —
// pairing the two back up here is what lets the table render one column per entry instead of
// collapsing them into one.
export interface ICompareDisplayProduct {
  product: Product;
  entry: ICompareProductEntry;
}

export interface ICompareCategoryTab {
  categoryKey: string;
  label: string;
  count: number;
}

export type CompareRowKindType = "text" | "price" | "rating" | "availability" | "boolean";

export interface ICompareTableRow {
  key: string;
  label: string;
  kind: CompareRowKindType;
  values: string[];
  differs: boolean;
  description?: string;
  /** Only set when kind is "boolean" — parallel to `values`/products, undefined where the product lacks the property. */
  boolValues?: (boolean | undefined)[];
}
