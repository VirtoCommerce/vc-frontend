import fs from "fs";
import path from "path";
import get from "lodash/get";
import set from "lodash/set";
import { main as getMissingKeys } from "./check-locales-folder-for-missing-keys";
import { translate } from "./translator";
import type { LocaleDataType } from "./check-locales-folder-for-missing-keys";

const PREFIX = "[FIX_LOCALES_UTILITY]";

export async function fixLocales() {
  const missingKeys = getMissingKeys();
  const allNeededFiles = missingKeys.reduce((acc, { originFile, targetFile, localeFolder }) => {
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
    console.error(`${PREFIX} Error reading files:`, error);
  }

  console.log(`\n---\n${PREFIX} Found ${missingKeys.length} missing keys, translating...`);

  for (const [index, { key, originFile, targetFile, localeFolder }] of missingKeys.entries()) {
    const originFilePath = path.join(localeFolder, originFile);
    const targetFilePath = path.join(localeFolder, targetFile);

    const originFileContent = get(fileContents, originFilePath);
    const targetFileContent = get(fileContents, targetFilePath);

    const originString = get(originFileContent, key) as string;
    const originLanguage = originFile.split(".")[0];
    const targetLanguage = targetFile.split(".")[0];

    const translatedString = await translate(originString as string, originLanguage, targetLanguage);
    const tableRow = `${key} (${index + 1}/${missingKeys.length})`;
    console.table({
      [originLanguage]: { [tableRow]: originString },
      [targetLanguage]: { [tableRow]: translatedString },
    });

    set(targetFileContent, key, translatedString);
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }

  await Promise.all(
    [...allNeededFiles].map(async (filename) => {
      await fs.promises.writeFile(filename, JSON.stringify(fileContents[filename], null, 2));
    }),
  );
  console.log(`${PREFIX} Translation completed successfully\n---\n`);
}

void fixLocales();
