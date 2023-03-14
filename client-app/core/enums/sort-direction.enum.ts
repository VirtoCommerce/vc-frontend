export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

// Declaration merging: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-namespaces-with-classes-functions-and-enums
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SortDirection {
  export function toggle(value: SortDirection): SortDirection {
    return value === SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
  }
}
