import fs from "fs";
import path from "path";
import groupBy from "lodash/groupBy.js";
import { main as getMissingKeys } from "./check-locales-missing-keys.js";
import { translate } from "./translator.js";
import type { LocaleDataType } from "./check-locales-missing-keys.js";

const PREFIX = "[FIX_LOCALES_UTILITY]";
const DELAY_BETWEEN_TRANSLATIONS_MS = 4000;

type LocaleNodeType = LocaleDataType | string;

function shouldTranslate(text: string) {
  return !text.startsWith("@:") && !text.startsWith("@:{");
}

function isLocaleDataType(value: unknown): value is LocaleDataType {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function fixLocales() {
  const missingKeys = getMissingKeys();
  if (missingKeys.length === 0) {
    console.log(`${PREFIX} No missing keys found`);
    return;
  }
  const groupedByTargetFile = groupBy(missingKeys, (item) => path.join(item.localeFolder, item.targetFile));

  console.log(`\n---\n${PREFIX} Found ${missingKeys.length} missing keys, translating...`);

  for (const [targetFilePath, keysToFix] of Object.entries(groupedByTargetFile)) {
    const { originFile, localeFolder } = keysToFix[0];
    const originFilePath = path.join(localeFolder, originFile);

    try {
      const originFileContent = JSON.parse(await fs.promises.readFile(originFilePath, "utf-8")) as LocaleDataType;
      const targetFileContent = JSON.parse(await fs.promises.readFile(targetFilePath, "utf-8")) as LocaleDataType;

      const originLanguage = originFile.split(".")[0];
      const targetLanguage = path.basename(targetFilePath).split(".")[0];

      console.log(`\n---\n${PREFIX} Processing ${targetFilePath}`);

      const missingKeySet = new Set(keysToFix.map((x) => x.key));
      let translatedCount = 0;

      async function translateAndLog(keyPath: string, sourceValue: string): Promise<string> {
        const translatedString = shouldTranslate(sourceValue)
          ? await translate(sourceValue, originLanguage, targetLanguage)
          : sourceValue;
        translatedCount += 1;
        const tableRow = `${keyPath} (${translatedCount}/${keysToFix.length})`;
        console.table({
          [originLanguage]: { [tableRow]: sourceValue },
          [targetLanguage]: { [tableRow]: translatedString },
        });
        if (shouldTranslate(sourceValue)) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_TRANSLATIONS_MS));
        }
        return translatedString;
      }

      function getTargetChildNode(targetNode: LocaleNodeType | undefined, key: string): LocaleNodeType | undefined {
        if (isLocaleDataType(targetNode)) {
          return targetNode[key] as LocaleNodeType | undefined;
        }
        return undefined;
      }

      async function rebuildFromSource(
        sourceNode: LocaleNodeType,
        targetNode: LocaleNodeType | undefined,
        parentPath: string,
      ): Promise<LocaleNodeType> {
        if (typeof sourceNode === "string") {
          const keyPath = parentPath;
          if (missingKeySet.has(keyPath)) {
            return translateAndLog(keyPath, sourceNode);
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
          const targetChild = getTargetChildNode(targetNode, key);
          result[key] = await rebuildFromSource(sourceChild, targetChild, nextPath);
        }
        return result;
      }

      const rebuilt = await rebuildFromSource(originFileContent, targetFileContent, "");

      await fs.promises.writeFile(targetFilePath, JSON.stringify(rebuilt, null, 2));
      console.log(`${PREFIX} Successfully updated ${targetFilePath}`);
    } catch (error) {
      console.error(
        `${PREFIX} Error processing ${targetFilePath}:`,
        error,
        "try again. Check api limits if restarting doesn't help.",
      );
    }
  }

  console.log(`${PREFIX} Translation completed successfully\n---\n`);
}

void fixLocales();
