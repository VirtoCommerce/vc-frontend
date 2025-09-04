import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

export type LocaleDataType = {
  [key: string]: string | LocaleDataType;
};

export type MissingKeyType = {
  key: string;
  originFile: string;
  targetFile: string;
  localeFolder: string;
};

function loadJson(filePath: string): LocaleDataType {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as LocaleDataType;
}

function getAllKeys(obj: LocaleDataType, parentKey: string = ""): string[] {
  let keys: string[] = [];
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object") {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else if (typeof value === "string") {
      keys.push(fullKey);
    }
  });
  return keys;
}

function compareKeys(
  baseKeys: string[],
  keysToCompare: string[],
  baseLang: string,
  compareLang: string,
  localeFolder: string,
): MissingKeyType[] {
  const missingInCompare = baseKeys.filter((key) => !keysToCompare.includes(key));

  return missingInCompare.map((key) => ({
    key,
    originFile: baseLang,
    targetFile: compareLang,
    localeFolder,
  }));
}

function validateLocaleFolder(localeFolder: string): boolean {
  if (!fs.existsSync(localeFolder)) {
    console.warn(`Warning: The specified directory "${localeFolder}" does not exist.`);
    console.warn(`Please provide a valid directory path. Example usage:`);
    console.warn(`yarn run check-locales -- path/to/your/locales`);
    return false;
  }
  return true;
}

function getJsonFiles(localeFolder: string): string[] {
  const files = fs.readdirSync(localeFolder).filter((file) => file.endsWith(".json"));
  if (files.length === 0) {
    console.warn("Warning: No JSON files found in the specified directory.");
  }
  return files;
}

function loadLocaleData(files: string[], localeFolder: string): { [key: string]: LocaleDataType } {
  const localeData: { [key: string]: LocaleDataType } = {};
  files.forEach((file) => {
    const filePath = path.join(localeFolder, file);
    localeData[file] = loadJson(filePath);
  });
  return localeData;
}

function getLocaleFolders(patterns: string[]): string[] {
  const folders: string[] = [];
  patterns.forEach((pattern) => {
    const matchedFolders = glob.sync(pattern, { absolute: true });
    folders.push(...matchedFolders);
  });
  return folders;
}

// @description: This script checks if all keys in the locales are presented.
// @usage: yarn check-locales --source en.json -- path/to/locales_folder path/to/**/locales
export function main(): MissingKeyType[] {
  const args = process.argv.slice(2);

  // Find the source file argument
  const sourceFileIndex = args.indexOf("--source");
  let sourceFileName: string;
  let patterns: string[];

  if (sourceFileIndex !== -1 && args.length > sourceFileIndex + 1) {
    sourceFileName = args[sourceFileIndex + 1];
    // Remove --source and its value from args
    patterns = args.filter((_, index) => index !== sourceFileIndex && index !== sourceFileIndex + 1);
  } else {
    console.error("Error: Please specify a source file using --source <filename>");
    console.error(`Example usage: yarn check-locales --source en.json "locales" "client-app/**/locales"`);
    return [];
  }

  if (patterns.length === 0) {
    patterns = ["locales"]; // Default to 'locales' if no argument is provided
  }

  const localeFolders = getLocaleFolders(patterns);

  const missingKeys: MissingKeyType[] = [];

  localeFolders.forEach((localeFolder) => {
    if (!validateLocaleFolder(localeFolder)) {
      return;
    }

    const files = getJsonFiles(localeFolder);
    if (files.length < 2) {
      return;
    }

    if (!files.includes(sourceFileName)) {
      console.warn(`Warning: Source file "${sourceFileName}" not found in "${localeFolder}". Skipping.`);
      return;
    }

    const localeData = loadLocaleData(files, localeFolder);
    const baseKeys = getAllKeys(localeData[sourceFileName]);

    Object.keys(localeData).forEach((compareFile) => {
      if (compareFile !== sourceFileName) {
        const keysToCompare = getAllKeys(localeData[compareFile]);
        const newMissingKeys = compareKeys(baseKeys, keysToCompare, sourceFileName, compareFile, localeFolder);
        missingKeys.push(...newMissingKeys);
      }
    });
  });

  return missingKeys;
}
