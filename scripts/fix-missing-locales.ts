import fs from "fs";
import path from "path";
import groupBy from "lodash/groupBy.js";
import { main as getMissingKeys } from "./check-locales-missing-keys.js";
import { translateBatch } from "./translator.js";
import type { LocaleDataType } from "./check-locales-missing-keys.js";

const PREFIX = "[FIX_LOCALES_UTILITY]";

const DELAY_BETWEEN_REQUESTS_MS = 4000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type LocaleNodeType = LocaleDataType | string;

type LeafType = { keyPath: string; sourceText: string };

function shouldTranslate(text: string) {
  return !text.startsWith("@:") && !text.startsWith("@:{");
}

function isLocaleDataType(value: unknown): value is LocaleDataType {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectMissingLeaves(
  node: LocaleNodeType,
  parentPath: string,
  missingKeySet: Set<string>,
  acc: LeafType[],
): void {
  if (typeof node === "string") {
    const keyPath = parentPath;
    if (missingKeySet.has(keyPath)) {
      acc.push({ keyPath, sourceText: node });
    }
    return;
  }
  for (const key of Object.keys(node)) {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    collectMissingLeaves(node[key] as LocaleNodeType, nextPath, missingKeySet, acc);
  }
}

function prepareBatchInput(leaves: LeafType[]): { texts: string[]; contexts: string[] } {
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

function buildTranslationsMap(leaves: LeafType[], translated: string[]): Map<string, string> {
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

async function rebuildFromSource(
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

async function processTargetFile(
  targetFilePath: string,
  keysToFix: Array<{ originFile: string; localeFolder: string; key: string }>,
): Promise<void> {
  const { originFile, localeFolder } = keysToFix[0];
  const originFilePath = path.join(localeFolder, originFile);

  const originFileContent = JSON.parse(await fs.promises.readFile(originFilePath, "utf-8")) as LocaleDataType;
  const targetFileContent = JSON.parse(await fs.promises.readFile(targetFilePath, "utf-8")) as LocaleDataType;

  const originLanguage = originFile.split(".")[0];
  const targetLanguage = path.basename(targetFilePath).split(".")[0];

  console.log(`\n---\n${PREFIX} Processing ${targetFilePath}`);

  const missingKeySet = new Set(keysToFix.map((x) => x.key));

  const leavesInSourceOrder: LeafType[] = [];
  collectMissingLeaves(originFileContent, "", missingKeySet, leavesInSourceOrder);

  const { texts: textsForTranslation, contexts } = prepareBatchInput(leavesInSourceOrder);

  let translatedTexts: string[] = [];
  if (textsForTranslation.length > 0) {
    translatedTexts = await translateBatch(textsForTranslation, contexts, originLanguage, targetLanguage);
  }

  const translationsMap = buildTranslationsMap(leavesInSourceOrder, translatedTexts);
  const translationsMapToLog = Array.from(translationsMap.entries()).reduce((acc: Record<string, { [key: string]: string }>, [key, value]) => {
    acc[key] = { [`${originLanguage} -> ${targetLanguage}`]: value };
    return acc;
  }, {});

  console.table(translationsMapToLog);



  const rebuilt = await rebuildFromSource(
    originFileContent,
    targetFileContent,
    "",
    missingKeySet,
    translationsMap,
  );

  await fs.promises.writeFile(targetFilePath, JSON.stringify(rebuilt, null, 2));
  console.log(`${PREFIX} 🟢 Successfully updated ${targetFilePath}`);
}

export async function fixLocales() {
  const startTimeMs = Date.now();
  const missingKeys = getMissingKeys();
  if (missingKeys.length === 0) {
    console.log(`${PREFIX} No missing keys found`);
    return;
  }
  const groupedByTargetFile = groupBy(missingKeys, (item) => path.join(item.localeFolder, item.targetFile));

  console.log(`\n---\n${PREFIX} Found ${missingKeys.length} missing keys, translating...`);

  const entries = Object.entries(groupedByTargetFile);
  for (let i = 0; i < entries.length; i += 1) {
    const [targetFilePath, keysToFix] = entries[i];
    try {
      await processTargetFile(targetFilePath, keysToFix as Array<{
        originFile: string;
        localeFolder: string;
        key: string;
      }>);
    } catch {
      console.warn(`${PREFIX} ❌ Error processing ${targetFilePath}.`);
      console.warn("try again. Check api limits if restarting doesn't help.");
    }
    if (i < entries.length - 1) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
  }

  console.log(`\n${PREFIX} ✅ Translation completed successfully\n`);
  const elapsedSeconds = ((Date.now() - startTimeMs) / 1000).toFixed(1);
  console.log(`${PREFIX} 🕐 Took ${elapsedSeconds}s in total\n---\n`);
}

void fixLocales();
