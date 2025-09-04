import type { LocaleDataType } from "./check-locales-missing-keys.js";

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

export function collectMissingLeaves(
  node: LocaleNodeType,
  parentPath: string,
  missingKeySet: Set<string>,
): LeafType[] {
  if (typeof node === "string") {
    const keyPath = parentPath;
    return missingKeySet.has(keyPath) ? [{ keyPath, sourceText: node }] : [];
  }

  return Object.keys(node).flatMap((key) => {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    return collectMissingLeaves(node[key] as LocaleNodeType, nextPath, missingKeySet);
  });
}

export function prepareBatchInput(leaves: LeafType[]): { texts: string[]; contexts: string[] } {
  const texts: string[] = [];
  const contexts: string[] = [];
  for (const leaf of leaves) {
    if (shouldTranslate(leaf.sourceText)) {
      texts.push(leaf.sourceText);
      contexts.push(leaf.keyPath);
    }
  }
  return { texts, contexts };
}

export function buildTranslationsMap(leaves: LeafType[], translated: string[]): Map<string, string> {
  const map = new Map<string, string>();
  let t = 0;
  for (const { keyPath, sourceText } of leaves) {
    if (shouldTranslate(sourceText)) {
      map.set(keyPath, translated[t]);
      t += 1;
    } else {
      map.set(keyPath, sourceText);
    }
  }
  return map;
}

export async function rebuildFromSource(
  sourceNode: LocaleNodeType,
  targetNode: LocaleNodeType | undefined,
  parentPath: string,
  missingKeySet: Set<string>,
  translationsMap: Map<string, string>,
): Promise<LocaleNodeType> {
  if (typeof sourceNode === "string") {
    const keyPath = parentPath;
    if (missingKeySet.has(keyPath)) {
      return translationsMap.get(keyPath) ?? sourceNode;
    }
    if (typeof targetNode === "string") {
      return targetNode;
    }
    return sourceNode;
  }

  const result: LocaleDataType = {};
  for (const key of Object.keys(sourceNode)) {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    const sourceChild = sourceNode[key] as LocaleNodeType;
    const targetChild = isLocaleDataType(targetNode) ? (targetNode[key] as LocaleNodeType | undefined) : undefined;
    result[key] = await rebuildFromSource(sourceChild, targetChild, nextPath, missingKeySet, translationsMap);
  }
  return result;
}
