export type FacetValueItem = {
  value: string;
  label: string;
  count?: number;
  selected: boolean;
};

export type FacetItem = {
  label: string;
  paramName: string;
  type: "terms" | "range";
  values: FacetValueItem[];
};
