import { Entity } from "@/core";

export abstract class Filter<Value = unknown> extends Entity {
  constructor(public value: Value) {
    super();
  }

  toString(): string {
    return `${this.value}`;
  }
}
