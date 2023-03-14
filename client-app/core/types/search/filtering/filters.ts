import type { Filter } from "./filter";

export class Filters extends Array<Filter> {
  toStrings(): string[] {
    return this.map((filter) => filter.toString());
  }

  override toString(): string {
    return this.toStrings().join(" ");
  }
}
