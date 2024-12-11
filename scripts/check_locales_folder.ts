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
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
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

// @description: This script checks if all keys in the locales are present in the en.json file.
// @usage: yarn check-locales -- path/to/locales_folder
function main(): void {
  const args = process.argv.slice(2);
  const localeFolder = args[0] || "locales"; // Default to 'locales' if no argument is provided

  const files = fs.readdirSync(localeFolder).filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    console.log("No JSON files found in the specified directory.");
    return;
  }

  // Load all JSON files
  const localeData: { [key: string]: LocaleDataType } = {};
  files.forEach((file) => {
    const filePath = path.join(localeFolder, file);
    localeData[file] = loadJson(filePath);
  });

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
}

main();
