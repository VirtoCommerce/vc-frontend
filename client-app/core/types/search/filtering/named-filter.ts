import { Filter } from "./filter";

export abstract class NamedFilter<Value> extends Filter<Value> {
  constructor(public fieldName: string, value: Value) {
    super(value);
  }

  toString(): string {
    return `${this.fieldName}:${this.value}`;
  }
}
