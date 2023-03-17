import { SearchEntity } from "@/core/types/search/entity";

export abstract class Filter<Value = unknown> extends SearchEntity {
  constructor(public value: Value) {
    super();
  }

  toString(): string {
    return `${this.value}`;
  }
}
