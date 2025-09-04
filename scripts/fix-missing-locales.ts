import fs from "fs";
import path from "path";
import groupBy from "lodash/groupBy.js";
import { main as getMissingKeys } from "./check-locales-missing-keys.js";
import {
  buildTranslationsMap,
  collectMissingLeaves,
  getLanguageFromFilename,
  prepareBatchInput,
  rebuildFromSource,
} from "./locale-utils.js";
import { translateBatch } from "./translator.js";
import type { LocaleDataType, MissingKeyType } from "./check-locales-missing-keys.js";

const PREFIX = "[FIX_LOCALES_UTILITY]";

const DEFAULT_DELAY_MS = 4000;
const DELAY_BETWEEN_REQUESTS_MS = Number.parseInt(process.env.FIX_LOCALES_DELAY_MS ?? "", 10) || DEFAULT_DELAY_MS;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processTargetFile(targetFilePath: string, keysToFix: MissingKeyType[]): Promise<void> {
  const { originFile, localeFolder } = keysToFix[0];
  const originFilePath = path.join(localeFolder, originFile);

  const originFileContent = JSON.parse(await fs.promises.readFile(originFilePath, "utf-8")) as LocaleDataType;
  const targetFileContent = JSON.parse(await fs.promises.readFile(targetFilePath, "utf-8")) as LocaleDataType;

  const originLanguage = getLanguageFromFilename(originFile);
  const targetLanguage = getLanguageFromFilename(path.basename(targetFilePath));

  console.log(`\n---\n${PREFIX} Processing ${targetFilePath}`);

  const missingKeySet = new Set(keysToFix.map((x) => x.key));

  const leavesInSourceOrder = collectMissingLeaves(originFileContent, "", missingKeySet);

  const { texts: textsForTranslation, contexts } = prepareBatchInput(leavesInSourceOrder);

  let translatedTexts: string[] = [];
  if (textsForTranslation.length > 0) {
    translatedTexts = await translateBatch(textsForTranslation, contexts, originLanguage, targetLanguage);
  }

  const translationsMap = buildTranslationsMap(leavesInSourceOrder, translatedTexts);

  const translationsMapToLog = Array.from(translationsMap.entries()).reduce(
    (acc: Record<string, { [key: string]: string }>, [key, value]) => {
      acc[key] = { [`${originLanguage} -> ${targetLanguage}`]: value };
      return acc;
    },
    {},
  );

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

  let isFirst = true;
  for (const [targetFilePath, keysToFix] of Object.entries(groupedByTargetFile)) {
    if (!isFirst && DELAY_BETWEEN_REQUESTS_MS > 0) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }
    isFirst = false;

    try {
      await processTargetFile(targetFilePath, keysToFix);
    } catch {
      console.warn(`${PREFIX} ❌ Error processing ${targetFilePath}.`);
      console.warn("try again. Check api limits if restarting doesn't help.");
    }
  }

  console.log(`\n${PREFIX} ✅ Translation completed successfully\n`);
  const elapsedSeconds = ((Date.now() - startTimeMs) / 1000).toFixed(1);
  console.log(`${PREFIX} 🕐 Took ${elapsedSeconds}s in total\n---\n`);
}

void fixLocales();
