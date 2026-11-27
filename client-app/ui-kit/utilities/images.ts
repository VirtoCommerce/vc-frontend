import type { IconVariantType } from "./icons";

export function getFlagIconUrl(name?: string) {
  return new URL(`../icons/flags/${name}.svg`, import.meta.url).href;
}

// Masks/silhouettes need fill, so this defaults to the solid set.
export function getIconUrl(name?: string, variant: IconVariantType = "solid") {
  return new URL(`../icons/${variant}/${name}.svg`, import.meta.url).href;
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
