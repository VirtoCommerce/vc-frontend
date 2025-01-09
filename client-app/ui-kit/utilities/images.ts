import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";

export function loadImage(fileName?: string): string {
  if (fileName) {
    try {
      return new URL(`/client-app/assets/images/${fileName}`, import.meta.url).href;
    } catch (error) {
      Logger.error(`Failed to load icon: ${fileName}`, error);
      return "";
    }
  } else {
    return "";
  }
}

export function loadIcon(name?: string) {
  if (name) {
    try {
      return new URL(`../icons/${name}.svg`, import.meta.url).href ?? "";
    } catch (error) {
      Logger.error(`Failed to load icon: ${name}`, error);
      return "";
    }
  } else {
    return "";
  }
}

export async function loadIconRaw(name?: string) {
  if (name) {
    try {
      const response = (await import(`../icons/${name}.svg?raw`)) as { default: string };
      return DOMPurify.sanitize(response.default);
    } catch (error) {
      Logger.error(`Failed to load icon: ${name}`, error);
      return "";
    }
  } else {
    return "";
  }
}
