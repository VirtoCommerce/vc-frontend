import { Entity } from "@/core";

export abstract class Filter<Value = unknown> extends Entity {
  constructor(public value: Value) {
    super();
  }

  toString(): string {
    const result = `${this.value}`;
    return result;
  }
}
