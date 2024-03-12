/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from "lodash";
import type { KeyValueType } from "@/core/api/graphql/types";

export function getBaseUrl(supportedLocales: string[]): string {
  const localeInPath = location.pathname.split("/")[1];
  return supportedLocales.includes(localeInPath) ? `/${localeInPath}/` : "";
}

export function getReturnUrlValue(): string | null {
  const { searchParams } = new URL(location.href);
  // FIXME: The `ReturnUrl` parameter is hardcoded in vc-storefront
  return searchParams.get("returnUrl") || searchParams.get("ReturnUrl");
}

export function sleep(ms: number, resolvedValue?: any): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms, resolvedValue));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getLinkTarget(openInNewTab: boolean): "_blank" | "_self" {
  return openInNewTab ? "_blank" : "_self";
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

/** @deprecated Use $n(value, "decimal", { notation: "compact" }) */
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

/**
 * Сonvert Date value to string with format 'yyyy-MM-dd'
 * @deprecated Use {@link Date.toISOString} to convert into full ISO 8601 string instead.
 */
export function dateToIsoDateString(date: Date | undefined) {
  const lastDateSymbolIndex = 10;
  return date?.toISOString().substring(0, lastDateSymbolIndex);
}

//todo add unit test
export function stringFormat(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match: string, num: number) => args[num] || match);
}

export function convertToType<To, From = Record<any, any>>(value?: From): To {
  return cloneDeep<To>(value as any);
}

export async function asyncForEach<T>(
  array: T[],
  callbackFn: (value: T, index: number, arr: T[]) => Promise<void>,
): Promise<void> {
  for (let i = 0, l = array.length; i < l; i++) {
    await callbackFn(array[i], i, array);
  }
}

export function extractNumberFromString(str: string): number {
  const regex = /\d+/;
  const match = regex.exec(str);
  return match ? parseInt(match[0]) : 0;
}

export function getValueByKey(data: KeyValueType[], key: string): string {
  const param = data.find((el) => el.key === key);

  if (!param?.value) {
    throw new Error(`Missed parameter ${key}`);
  }

  return param.value;
}

export function objectToKeyValues(object: { [key: string]: string }): KeyValueType[] {
  return Object.keys(object).map((key) => ({
    key,
    value: object[key],
  }));
}
