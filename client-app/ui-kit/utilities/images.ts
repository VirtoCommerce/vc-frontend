import type { IconVariantType } from "./icons";

export function getImageUrl(fileName?: string) {
  return new URL(`../../assets/images/${fileName}`, import.meta.url).href;
}

export function getFlagIconUrl(name?: string) {
  return new URL(`../icons/flags/${name}.svg`, import.meta.url).href;
}

// Masks/silhouettes need fill, so this defaults to the solid set.
export function getIconUrl(name?: string, variant: IconVariantType = "solid") {
  return new URL(`../icons/${variant}/${name}.svg`, import.meta.url).href;
}
