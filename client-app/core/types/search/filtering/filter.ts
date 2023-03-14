import { SearchEntity } from "@/core/types";

export abstract class Filter<Value = unknown> extends SearchEntity {
  constructor(public value: Value) {
    super();
  }

  toString(): string {
    return `${this.value}`;
  }
}
