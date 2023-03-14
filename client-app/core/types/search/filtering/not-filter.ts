import { Filter } from "./filter";

export class NotFilter<Value extends Filter> extends Filter<Value> {
  toString(): string {
    return `NOT(${this.value})`;
  }
}
