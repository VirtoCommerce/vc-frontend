import { Dictionary } from 'core/models/dictionary';

export function safeInvoke<T, R>(arg: T | null | undefined, callback: (arg: T) => R): R | undefined {
  return arg != null ? callback(arg) : undefined;
}

export function toDictionary(obj: any): Dictionary<string | (string | null)[] | null | undefined> {
  const result: Dictionary<string> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key]?.toString();
    if (value) {
      result[key] = value;
    }
  }
  return result;
}


export function appendToFilename(filename: string, suffix: string, checkIfSuffixExists = false ){
  const dotIndex = filename.lastIndexOf(".");
  let result = filename
  if (dotIndex == -1) {
    result = checkIfSuffixExists && filename.endsWith(suffix)?  filename : filename + suffix ;
  }
  else {
    const fileNameWithoutExt = filename.substring(0, dotIndex);
    result = checkIfSuffixExists && fileNameWithoutExt.endsWith(suffix) ? filename :  fileNameWithoutExt + suffix + filename.substring(dotIndex);
  }
  return result;
}


export function removeStoreAndLocaleFromUrl(baseUrlStr: string, storeName: string, locale: string): string {
  const baseUrl = new URL(baseUrlStr);
  const pathname = baseUrl.pathname.replace(`/${storeName}`, '/')
    .replace(new RegExp(`/${locale}`), '/')
    .replace(/[/]+$/, "");
  baseUrl.pathname = pathname;
  const result = baseUrl.href.replace(/[/]+$/, "");
  return result;
}
