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

export type FacetFilterChangeType = {
  filterType: string;
  isGenerated: boolean;
  label?: string;
  name: string;
  rangeValues?: FacetFilterRangeValueType[];
  termValues?: FacetFilterTermValueType[];
};

export type FacetFilterRangeValueType = {
  includeLowerBound: boolean;
  includeUpperBound: boolean;
  lower?: string;
  upper?: string;
};

export type FacetFilterTermValueType = {
  label?: string;
  value: string;
};
