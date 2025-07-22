export type FacetValueItemType = {
  value: string;
  label: string;
  count?: number;
  selected: boolean;
  from?: number;
  includeFrom?: boolean;
  to?: number;
  includeTo?: boolean;
};

export type FacetItemType = {
  label: string;
  paramName: string;
  type: "terms" | "range";
  values: FacetValueItemType[];
  statistics?: {
    min?: number;
    max?: number;
  }
};
