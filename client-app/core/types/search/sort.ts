import { DEFAULT_SORT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { SearchEntity } from "./entity";

export class Sort extends SearchEntity {
  constructor(public fieldName: string, public direction: SortDirection) {
    super();
  }

  override toString(): string {
    return `${this.fieldName}:${this.direction}`;
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
