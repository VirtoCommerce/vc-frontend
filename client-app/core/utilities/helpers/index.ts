export function sleep(ms: number, resolvedValue?: any): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms, resolvedValue));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function isObjectEmpty(object: Record<string, unknown>): boolean {
  for (const property in object) {
    return false;
  }

  return true;
}

export function trimString(str: string | null | undefined): string {
  return str?.trim() || "";
}
