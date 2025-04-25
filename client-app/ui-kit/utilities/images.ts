// eslint-disable-next-line import/no-named-as-default
import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";

export function getImageUrl(fileName?: string) {
  return new URL(`../../assets/images/${fileName}`, import.meta.url).href;
}

export function getIconUrl(name?: string) {
  return new URL(`../icons/${name}.svg`, import.meta.url).href;
}

export async function loadIconRaw(name?: string) {
  if (!name) {
    return "";
  }

  try {
    const response = (await import(`../icons/${name}.svg?raw`)) as { default: string };
    return DOMPurify.sanitize(response.default);
  } catch (error) {
    Logger.error(`Failed to load icon: ${name}`, error);
    return "";
  }
}
