import { Filter } from "./filter";

export type Filters = Filter[];

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Filters {
  export function toStrings(filters: Filters | undefined): string[] | undefined {
    return filters?.map((filter) => filter.toString());
  }

  export function toString(filters: Filters | undefined): string | undefined {
    return toStrings(filters)?.join(" ");
  }
}
