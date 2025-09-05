import get from "lodash/get.js";
import set from "lodash/set.js";
import type { LocaleDataType, MissingKeyType } from "./check-locales-missing-keys.js";
import type { BatchItemType } from "./translator.js";

export type LocaleNodeType = LocaleDataType | string;
export type LeafType = { keyPath: string; sourceText: string };

export function shouldTranslate(text: string): boolean {
  return !text.startsWith("@:") && !text.startsWith("@:{");
}

export function isLocaleDataType(value: unknown): value is LocaleDataType {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getLanguageFromFilename(filename: string): string {
  return filename.split(".")[0];
}

export function getLeafPaths(node: LocaleNodeType, parentPath = ""): string[] {
  if (typeof node === "string") {
    return [parentPath];
  }

  return Object.keys(node).flatMap((key) => {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    return getLeafPaths(node[key] as LocaleNodeType, nextPath);
  });
}

export function createLeavesFromKeys(
  keysToFix: MissingKeyType[],
  originFileContent: LocaleDataType,
): LeafType[] {
  return keysToFix
    .map(({ key }) => ({
      keyPath: key,
      sourceText: get(originFileContent, key) as string,
    }))
    .filter(({ sourceText }) => typeof sourceText === "string");
}

export function prepareBatchInput(leaves: LeafType[]): BatchItemType[] {
  const items: BatchItemType[] = [];
  for (const leaf of leaves) {
    if (shouldTranslate(leaf.sourceText)) {
      items.push({ key: leaf.keyPath, text: leaf.sourceText });
    }
  }
  return items;
}

export function buildTranslationsMap(
  leaves: LeafType[],
  translated: string[],
): Map<string, { sourceText: string; translatedText: string }> {
  const map = new Map<string, { sourceText: string; translatedText: string }>();
  let t = 0;
  for (const { keyPath, sourceText } of leaves) {
    if (shouldTranslate(sourceText)) {
      map.set(keyPath, { sourceText, translatedText: translated[t] });
      t += 1;
    } else {
      map.set(keyPath, { sourceText, translatedText: sourceText });
    }
  }
  return map;
}

export function buildNewLocaleContent(
  originContent: LocaleDataType,
  targetContent: LocaleDataType,
  translationsMap: Map<string, { sourceText: string; translatedText: string }>,
  missingKeySet: Set<string>,
): LocaleDataType {
  const rebuilt = {};
  const allSourceLeafPaths = getLeafPaths(originContent, "");

  for (const keyPath of allSourceLeafPaths) {
    const value = missingKeySet.has(keyPath)
      ? translationsMap.get(keyPath)?.translatedText
      : get(targetContent, keyPath);

    if (value !== undefined) {
      set(rebuilt, keyPath, value);
    }
  }
  return rebuilt as LocaleDataType;
}
