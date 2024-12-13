import * as fs from "fs";
import * as path from "path";

type LocaleDataType = {
  [key: string]: string | LocaleDataType;
};

function loadJson(filePath: string): LocaleDataType {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data) as LocaleDataType;
}

function getAllKeys(obj: LocaleDataType, parentKey: string = ""): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        keys = keys.concat(getAllKeys(value, fullKey));
      } else if (typeof value === "string") {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

function compareKeys(baseKeys: string[], keysToCompare: string[], baseLang: string, compareLang: string): void {
  const missingInCompare = baseKeys.filter((key) => !keysToCompare.includes(key));
  if (missingInCompare.length > 0) {
    console.log(`Keys missing in ${compareLang} compared to ${baseLang}:`);
    missingInCompare.forEach((key) => console.log(`  - ${key}`));
  }
}

function validateLocaleFolder(localeFolder: string): boolean {
  if (!fs.existsSync(localeFolder)) {
    console.log(`The specified directory "${localeFolder}" does not exist.`);
    console.log(`Please provide a valid directory path. Example usage:`);
    console.log(`yarn run check-locales -- path/to/your/locales`);
    return false;
  }
  return true;
}

function getJsonFiles(localeFolder: string): string[] {
  const files = fs.readdirSync(localeFolder).filter((file) => file.endsWith(".json"));
  if (files.length === 0) {
    console.log("No JSON files found in the specified directory.");
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

// @description: This script checks if all keys in the locales are present in the en.json file.
// @usage: yarn check-locales -- path/to/locales_folder
function main(): void {
  const args = process.argv.slice(2);
  const localeFolders = args.length > 0 ? args : ["locales"]; // Default to 'locales' if no argument is provided

  localeFolders.forEach((localeFolder) => {
    if (!validateLocaleFolder(localeFolder)) {
      return;
    }

    const files = getJsonFiles(localeFolder);
    if (files.length === 0) {
      return;
    }

    const localeData = loadLocaleData(files, localeFolder);

    // Get all keys for each locale
    const localeKeys: { [key: string]: string[] } = {};
    for (const file in localeData) {
      if (Object.hasOwn(localeData, file)) {
        localeKeys[file] = getAllKeys(localeData[file]);
      }
    }

    // Compare keys between each pair of locale files
    for (const baseFile in localeKeys) {
      if (Object.hasOwn(localeKeys, baseFile)) {
        for (const compareFile in localeKeys) {
          if (Object.hasOwn(localeKeys, compareFile) && baseFile !== compareFile) {
            compareKeys(localeKeys[baseFile], localeKeys[compareFile], baseFile, compareFile);
          }
        }
      }
    }
  });
}

main();
