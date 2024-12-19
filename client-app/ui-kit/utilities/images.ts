import DOMPurify from "dompurify";

export function loadIcon(name?: string): string {
  return new URL(`../icons/${name}.svg`, import.meta.url).href ?? "";
}

export async function loadIconRaw(name?: string): Promise<string> {
  const response = (await import(`../icons/${name}.svg?raw`)) as { default: string };
  return DOMPurify.sanitize(response.default);
}
