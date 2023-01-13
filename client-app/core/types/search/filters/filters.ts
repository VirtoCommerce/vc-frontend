import { Filter } from "./filter";

export type Filters = Filter[];

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Filters {
  export function toStrings(filters: Filters | undefined): string[] | undefined {
    const result = filters?.map((filter) => filter.toString());
    return result;
  }

  export function toString(filters: Filters | undefined): string | undefined {
    const result = toStrings(filters)?.join(" ");
    return result;
  }
}
