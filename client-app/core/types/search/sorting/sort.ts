import { SortDirection } from "@/core/enums";
import { SearchEntity } from "@/core/types/search/entity";
import type { SortDirectionType, ISortInfo } from "./sort-info";

const VALID_DIRECTIONS = new Set<SortDirectionType>([SortDirection.Ascending, SortDirection.Descending]);

export class Sort extends SearchEntity implements ISortInfo {
  get column() {
    return this.fieldName;
  }

  set column(value: string) {
    this.fieldName = value;
  }

  constructor(
    public fieldName: string = "createdDate",
    public direction: SortDirectionType = SortDirection.Descending,
  ) {
    super();
  }

  toggle(): SortDirectionType {
    return this.direction === SortDirection.Ascending ? SortDirection.Ascending : SortDirection.Descending;
  }

  override toString(): string {
    return `${this.fieldName}:${this.direction}`;
  }

  static fromString(str: string): Sort {
    const [fieldName, direction] = str.split(":");
    let result: Sort;
    if (fieldName && direction && VALID_DIRECTIONS.has(direction as SortDirectionType)) {
      result = new Sort(fieldName, direction as SortDirectionType);
    } else {
      result = new Sort();
    }
    return result;
  }
}
