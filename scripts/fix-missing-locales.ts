import fs from "fs";
import path from "path";
import get from "lodash/get";
import set from "lodash/set";
import { main as getMissingKeys } from "./check-locales-missing-keys";
import { translate } from "./translator";
import type { LocaleDataType } from "./check-locales-missing-keys";

const PREFIX = "[FIX_LOCALES_UTILITY]";
const DELAY_BETWEEN_TRANSLATIONS_MS = 4000;

function shouldTranslate(text: string) {
  return !text.startsWith("@:") && !text.startsWith("@:{");
}

export async function fixLocales() {
  const missingKeys = getMissingKeys();
  if (missingKeys.length === 0) {
    console.log(`${PREFIX} No missing keys found`);
    return;
  }
  const allNeededFiles = missingKeys.reduce((acc, {originFile, targetFile, localeFolder}) => {
    acc.add(path.join(localeFolder, originFile));
    acc.add(path.join(localeFolder, targetFile));
    return acc;
  }, new Set<string>());

  const fileContents: Record<string, LocaleDataType> = {};
  try {
    await Promise.all(
      [...allNeededFiles].map(async (filename) => {
        const fileData = await fs.promises.readFile(filename, "utf-8");
        fileContents[filename] = JSON.parse(fileData) as LocaleDataType;
      }),
    );
  } catch (error) {
    console.error(`${PREFIX} Error reading files:`, error, "try again..");
    return;
  }

  console.log(`\n---\n${PREFIX} Found ${missingKeys.length} missing keys, translating...`);

  for (const [index, { key, originFile, targetFile, localeFolder }] of missingKeys.entries()) {
    try {
      const originFilePath = path.join(localeFolder, originFile);
      const targetFilePath = path.join(localeFolder, targetFile);

      const originFileContent = get(fileContents, originFilePath);
      const targetFileContent = get(fileContents, targetFilePath);

      const originString = get(originFileContent, key) as string;
      const originLanguage = originFile.split(".")[0];
      const targetLanguage = targetFile.split(".")[0];

      const translatedString = shouldTranslate(originString)
        ? await translate(originString, originLanguage, targetLanguage)
        : originString;

      const tableRow = `${key} (${index + 1}/${missingKeys.length})`;
      console.table({
        [originLanguage]: {[tableRow]: originString},
        [targetLanguage]: {[tableRow]: translatedString},
      });

      set(targetFileContent, key, translatedString);
      if (shouldTranslate(originString)) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_TRANSLATIONS_MS)); // delay to avoid API rate limits
      }
    } catch (error) {
      console.error(
        `${PREFIX} Error translating ${key}:`,
        error,
        "try again. Check api limits if restarting doesn't help.",
      );
      return;
    }
  }

  try {
    await Promise.all(
      [...allNeededFiles].map(async (filename) => {
        await fs.promises.writeFile(filename, JSON.stringify(fileContents[filename], null, 2));
      }),
    );
    console.log(`${PREFIX} Translation completed successfully\n---\n`);
  } catch (error) {
    console.error(`${PREFIX} Error writing files:`, error, "check results and run script again if needed.");
  }
}

void fixLocales();
