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

// check if object is empty
export function isObjectEmpty(object: Record<string, unknown>): boolean {
  for (const _property in object) {
    return false;
  }

  return true;
}

export function trimString(str: string | null | undefined): string {
  return str?.trim() || "";
}

// convert Date value to string with format 'yyyy-MM-dd'
export function dateToIsoDateString(date: Date | undefined) {
  const lastDateSymbolIndex = 10;
  return date?.toISOString().substring(0, lastDateSymbolIndex);
}

export function nameOf<T>(key: keyof T, _instance?: T): keyof T {
  return key;
}

export function toggleBodyOverflowHidden() {
  document.body.classList.toggle("overflow-hidden");
}
