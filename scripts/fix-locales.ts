import fs from "fs";
import path from "path";
import get from "lodash/get";
import set from "lodash/set";
import { main as getMissingKeys } from "./check-locales-folder-for-missing-keys";
import { translate } from "./translator";
import type { LocaleDataType } from "./check-locales-folder-for-missing-keys";

export async function fixLocales() {
  const missingKeys = getMissingKeys();
  const allNeededFiles = missingKeys.reduce((acc, { originFile, targetFile, localeFolder }) => {
    acc.add(path.join(localeFolder, originFile));
    acc.add(path.join(localeFolder, targetFile));
    return acc;
  }, new Set<string>());
  console.log("---", allNeededFiles);

  const fileContents: Record<string, LocaleDataType> = {};
  try {
    await Promise.all(
      [...allNeededFiles].map(async (filename) => {
        const fileData = await fs.promises.readFile(filename, "utf-8");
        fileContents[filename] = JSON.parse(fileData) as LocaleDataType;
      }),
    );
  } catch (error) {
    console.error("Error reading files:", error);
  }

  for (const { key, originFile, targetFile, localeFolder } of missingKeys) {
    const originFilePath = path.join(localeFolder, originFile);
    const targetFilePath = path.join(localeFolder, targetFile);
    const originFileContent = get(fileContents, originFilePath);
    const targetFileContent = get(fileContents, targetFilePath);
    const originString = get(originFileContent, key);
    const translatedString = await translate(
      originString as string,
      originFile.split(".")[0],
      targetFile.split(".")[0],
    );
    set(targetFileContent, key, translatedString);
  }

  await Promise.all(
    [...allNeededFiles].map(async (filename) => {
      await fs.promises.writeFile(filename, JSON.stringify(fileContents[filename], null, 2));
    }),
  );
}

void fixLocales();
