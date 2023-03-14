import { NamedFilter } from "../named-filter";
import type { RangeFilterValue } from "./range-filter-value";

export class RangeFilter<Value = unknown> extends NamedFilter<RangeFilterValue<Value>> {}
