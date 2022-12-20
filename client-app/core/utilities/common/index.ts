import { ISortInfo } from "@/core/types";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";

export const defaultSortInfo: ISortInfo = {
  column: "createdDate",
  direction: SORT_DESCENDING,
};

export function getBaseUrl(supportedLocales: string[]): string {
  const localeInPath = location.pathname.split("/")[1];
  return supportedLocales.includes(localeInPath) ? `/${localeInPath}/` : "";
}

export function sleep(ms: number, resolvedValue?: any): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms, resolvedValue));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function appendSuffixToFilename(filename: string, suffix: string, checkIfSuffixExists = false) {
  if (!filename) {
    return filename;
  }

  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return checkIfSuffixExists && filename.endsWith(suffix) ? filename : filename + suffix;
  }

  const fileNameWithoutExtension = filename.substring(0, dotIndex);

  return checkIfSuffixExists && fileNameWithoutExtension.endsWith(suffix)
    ? filename
    : fileNameWithoutExtension + suffix + filename.substring(dotIndex);
}

export function numberToShortString(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const sizes = [
    { value: 1e3, suffix: "K" },
    { value: 1e6, suffix: "M" },
    { value: 1e9, suffix: "B" },
    { value: 1e12, suffix: "T" },
    { value: 1e15, suffix: "P" },
    { value: 1e18, suffix: "E" },
  ];

  let index;

  for (index = sizes.length - 1; index > 0; index -= 1) {
    if (num >= sizes[index].value) {
      break;
    }
  }

  return (num / sizes[index].value).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + sizes[index].suffix;
}

export function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}

export function getSortInfoFromStringExpression(sortInfo: string): ISortInfo {
  const splitted: string[] = sortInfo.split(":");
  return splitted.length > 1
    ? {
        column: splitted[0],
        direction: splitted[1],
      }
    : defaultSortInfo;
}

export function toggleSortDirection(currentDirection: string): string {
  return currentDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
}

// convert Date value to string with format 'yyyy-MM-dd'
export function dateToIsoDateString(date: Date | undefined) {
  const lastDateSymbolIndex = 10;
  return date?.toISOString().substring(0, lastDateSymbolIndex);
}

export function stringFormat(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match: string, num: number) => args[num] || match);
}

export function convertToType<To, From = Record<any, any>>(value?: From): To {
  return value as unknown as To;
}

export async function asyncForEach<T>(
  array: T[],
  callbackFn: (value: T, index: number, arr: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0, l = array.length; i < l; i++) {
    await callbackFn(array[i], i, array);
  }
}
