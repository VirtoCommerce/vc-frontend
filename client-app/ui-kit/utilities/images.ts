import domPurify from "dompurify";
import { Logger } from "@/core/utilities";

// Default paths
let imagePath: string;
let iconPath: string;

// Settings interface that matches the one from UIKitSettings
interface IImagePaths {
  images: string;
  icons: string;
}

// Function to set paths from settings
export function setImageSettings(paths: IImagePaths): void {
  imagePath = paths.images;
  iconPath = paths.icons;
}

export function getImageUrl(fileName?: string) {
  if (!fileName) {
    return "";
  }
  return new URL(`${imagePath}/${fileName}`, import.meta.url).href;
}

export function getIconUrl(name?: string) {
  if (!name) {
    return "";
  }
  return new URL(`${iconPath}/${name}.svg`, import.meta.url).href;
}

export async function loadIconRaw(name?: string) {
  if (!name) {
    return "";
  }

  try {
    const response = (await import(`${iconPath}/${name}.svg?raw`)) as { default: string };
    return domPurify.sanitize(response.default);
  } catch (error) {
    Logger.error(`Failed to load icon: ${name}`, error);
    return "";
  }
}
