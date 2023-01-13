import { DEFAULT_SORT, Entity, SortDirection } from "@/core";

export class Sort extends Entity {
  constructor(public fieldName: string, public direction: SortDirection) {
    super();
  }

  override toString(): string {
    const result = `${this.fieldName}:${this.direction}`;
    return result;
  }

  static fromString(str: string): Sort {
    const splitted: string[] = str.split(":");
    let result = DEFAULT_SORT;
    if (splitted.length === 2) {
      const fieldName = splitted[0];
      const direction =
        splitted[1] === SortDirection.Ascending || splitted[1] === SortDirection.Descending
          ? (splitted[1] as SortDirection)
          : null;
      if (direction) {
        result = new Sort(fieldName, direction);
      }
    }
    return result;
  }
}
