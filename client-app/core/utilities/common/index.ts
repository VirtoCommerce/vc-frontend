/* eslint-disable @typescript-eslint/no-explicit-any */
import { uniqBy } from "lodash";

export function getBaseUrl(supportedLocales: string[]): string {
  const localeInPath = location.pathname.split("/")[1];
  return supportedLocales.includes(localeInPath) ? `/${localeInPath}/` : "";
}

export function getReturnUrlValue(): string | null {
  const { searchParams } = new URL(location.href);
  return searchParams.get("returnUrl") || searchParams.get("ReturnUrl");
}

export function extractHostname(url: string) {
  let hostname = "";

  // Find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  // Find & remove port number
  hostname = hostname.split(":")[0];

  // Find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
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

export function stringFormat(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match: string, num: number) => args[num] || match);
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

export function replaceXFromBeginning(input: string, by: string = "•••• "): string {
  return input.replace(/^X+/, by);
}

import type { RouteLocationRaw } from "vue-router";

type LinkAttrType = { to: RouteLocationRaw } | { externalLink: string } | object;

export const getLinkAttr = (link?: RouteLocationRaw): LinkAttrType => {
  if (typeof link === "string") {
    if (link.startsWith("/")) {
      return { to: link };
    } else {
      return { externalLink: link };
    }
  }
  return {};
};

export type UniqByLastIterateeType<T> = keyof T | ((item: T) => unknown);
export function uniqByLast<T>(arr: T[], iteratee: UniqByLastIterateeType<T>): T[] {
  return uniqBy(arr.slice().reverse(), iteratee).reverse();
}
