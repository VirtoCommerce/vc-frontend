import { Logger } from "@/core";
import { FacetRangeType } from "@/xapi";
import { RangeBound } from "./range-bound";

export class RangeFilterValue<Value = unknown> {
  constructor(public from?: RangeBound<Value>, public to?: RangeBound<Value>) {
    if (from === undefined && to === undefined) {
      const error = new Error("At least one bound should be specified");
      Logger.error(`${Range.name}.constructor`, error);
      throw error;
    }
  }

  toString(): string {
    const firstBracket = this.from?.include ? "[" : "(";
    const lastBracket = this.to?.include ? "]" : ")";

    const fromStr = this.from?.value ? `${this.from?.value} ` : "";
    const toStr = this.to?.value ? ` ${this.to?.value}` : "";

    const result = `${firstBracket}${fromStr}TO${toStr}${lastBracket}`;
    return result;
  }

  static fromFacetRange(facetRange: FacetRangeType): RangeFilterValue<number> {
    const from = new RangeBound<number>(facetRange.includeFrom, facetRange.from);
    const to = new RangeBound<number>(facetRange.includeTo, facetRange.to);
    const result = new RangeFilterValue<number>(from, to);
    return result;
  }
}
