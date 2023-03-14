import { DEFAULT_SORT } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { SearchEntity } from "@/core/types";

export class Sort extends SearchEntity {
  constructor(public fieldName: string, public direction: SortDirection) {
    super();
  }

  override toString(): string {
    return `${this.fieldName}:${this.direction}`;
  }

  static fromString(str: string): Sort {
    const [fieldName, direction] = str.split(":");
    let result = DEFAULT_SORT;
    if (fieldName && direction && (direction == SortDirection.Ascending || direction == SortDirection.Descending)) {
      result = new Sort(fieldName, direction as SortDirection);
    }
    return result;
  }
}
