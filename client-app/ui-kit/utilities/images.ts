export function loadImage(fileName: string): string {
  return new URL(`/client-app/assets/images/${fileName}`, import.meta.url).href;
}

export function isFilenameOnly(src: string): boolean {
  return /^[^/]+(\.[a-zA-Z0-9]+)?$/.test(src);
}
