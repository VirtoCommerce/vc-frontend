import fs from "fs";
import path from "path";
import { groupBy } from "lodash-es";
import { main as getMissingKeys } from "./check-locales-missing-keys.js";
import {
  buildNewLocaleContent,
  buildTranslationsMap,
  createLeavesFromKeys,
  getLanguageFromFilename,
  prepareBatchInput,
} from "./locale-utils.js";
import { translateBatch } from "./translator.js";
import type { MissingKeyType, LocaleDataType } from "./check-locales-missing-keys.js";

const PREFIX = "[FIX_LOCALES_UTILITY]";

const DEFAULT_DELAY_MS = 4000;
const DELAY_BETWEEN_REQUESTS_MS = Number.parseInt(process.env.FIX_LOCALES_DELAY_MS ?? "", 10) || DEFAULT_DELAY_MS;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// localeFolder/targetFile both trace back to CLI-supplied glob patterns (see
// check-locales-missing-keys.ts), so before writing the translated result back
// out, pin the resolved destination to stay inside the resolved locale folder.
function resolveLocaleJsonPath(localeFolder: string, filePath: string): string {
  const resolvedFolder = path.resolve(localeFolder);
  const resolvedFilePath = path.resolve(filePath);
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: path.resolve always returns a string
  if (!resolvedFilePath.startsWith(resolvedFolder + path.sep) || path.extname(resolvedFilePath) !== ".json") {
    throw new Error(`Refusing to write outside the locale folder: "${filePath}"`);
  }
  return resolvedFilePath;
}

async function processTargetFile(targetFilePath: string, keysToFix: MissingKeyType[]): Promise<void> {
  const { originFile, localeFolder } = keysToFix[0];
  const originFilePath = path.join(localeFolder, originFile);
  const resolvedTargetFilePath = resolveLocaleJsonPath(localeFolder, targetFilePath);

  const [originFileContent, targetFileContent] = (await Promise.all([
    fs.promises.readFile(originFilePath, "utf-8").then(JSON.parse),
    fs.promises.readFile(resolvedTargetFilePath, "utf-8").then(JSON.parse),
  ])) as [LocaleDataType, LocaleDataType];

  const originLanguage = getLanguageFromFilename(originFile);
  const targetLanguage = getLanguageFromFilename(path.basename(targetFilePath));

  const leavesInSourceOrder = createLeavesFromKeys(keysToFix, originFileContent);
  const itemsForTranslation = prepareBatchInput(leavesInSourceOrder);

  let translatedTexts: string[] = [];
  if (itemsForTranslation.length > 0) {
    translatedTexts = await translateBatch(itemsForTranslation, originLanguage, targetLanguage);
  }

  const translationsMap = buildTranslationsMap(leavesInSourceOrder, translatedTexts);

  const translationsMapToLog = Array.from(translationsMap.entries()).reduce(
    (acc: Record<string, { [key: string]: string }>, [key, { sourceText, translatedText }]) => {
      acc[key] = {
        [originLanguage]: sourceText,
        [targetLanguage]: translatedText,
      };
      return acc;
    },
    {},
  );

  console.table(translationsMapToLog);

  const missingKeySet = new Set(keysToFix.map((k) => k.key));
  const rebuilt = buildNewLocaleContent(originFileContent, targetFileContent, translationsMap, missingKeySet);

  await fs.promises.writeFile(resolvedTargetFilePath, JSON.stringify(rebuilt, null, 2));
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

  let index = 0;
  const total = Object.entries(groupedByTargetFile).length;
  for (const [targetFilePath, keysToFix] of Object.entries(groupedByTargetFile)) {
    if (index > 0 && DELAY_BETWEEN_REQUESTS_MS > 0) {
      await delay(DELAY_BETWEEN_REQUESTS_MS);
    }

    console.log(`\n---\nProcessing ${targetFilePath} (${index + 1}/${total})`);

    try {
      await processTargetFile(targetFilePath, keysToFix);
      console.log(`🟢 Successfully updated ${targetFilePath} (${index + 1}/${total})`);
    } catch {
      console.warn(`❌ Error processing ${targetFilePath}.`);
      console.warn("try again. Check api limits if restarting doesn't help.");
    } finally {
      index += 1;
    }
  }

  console.log("\n✅ Translation completed successfully\n");
  const elapsedSeconds = ((Date.now() - startTimeMs) / 1000).toFixed(1);
  console.log(`🕐 Took ${elapsedSeconds}s in total\n---\n`);
}

void fixLocales();
