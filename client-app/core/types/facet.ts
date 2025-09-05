export type FacetValueItemType = {
  value: string;
  label: string;
  count?: number;
  // @deprecated calculate this from filter
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
  };
};
