import { Filter } from "./filter";

export class NotFilter<Value extends Filter> extends Filter<Value> {
  toString(): string {
    const result = `NOT(${this.value})`;
    return result;
  }
}
