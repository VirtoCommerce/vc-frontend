import { SortDirection } from "@/core/enums/sort-direction.enum";
import { SearchEntity } from "@/core/types/search/entity";
import type { ISortInfo } from "./sort-info";

export class Sort extends SearchEntity implements ISortInfo {
  get column() {
    return this.fieldName;
  }

  set column(value: string) {
    this.fieldName = value;
  }

  constructor(
    public fieldName: string = "createdDate",
    public direction: SortDirection = SortDirection.Descending,
  ) {
    super();
  }

  toggle(): SortDirection {
    return this.direction === SortDirection.Ascending ? SortDirection.Ascending : SortDirection.Descending;
  }

  override toString(): string {
    return `${this.fieldName}:${this.direction}`;
  }

  static fromString(str: string): Sort {
    const [fieldName, direction] = str.split(":");
    let result: Sort;
    if (fieldName && direction && direction in SortDirection) {
      result = new Sort(fieldName, direction as SortDirection);
    } else {
      result = new Sort();
    }
    return result;
  }
}
