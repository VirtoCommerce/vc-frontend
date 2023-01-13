import { Filter } from "./filter";

export abstract class NamedFilter<Value> extends Filter<Value> {
  constructor(public fieldName: string, value: Value) {
    super(value);
  }

  toString(): string {
    const result = `${this.fieldName}:${this.value}`;
    return result;
  }
}
