export enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

// Workaround as typescript doesn't support enums
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SortDirection {
  export function toggle(value: SortDirection): SortDirection {
    return value === SortDirection.Ascending ? SortDirection.Descending : SortDirection.Ascending;
  }
}
