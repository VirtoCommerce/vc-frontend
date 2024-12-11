import * as fs from 'fs';
import * as path from 'path';

function loadJson(filePath: string): any {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function getAllKeys(obj: any, parentKey: string = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                keys = keys.concat(getAllKeys(obj[key], fullKey));
            } else {
                keys.push(fullKey);
            }
        }
    }
    return keys;
}

function compareKeys(baseKeys: string[], compareKeys: string[], baseLang: string, compareLang: string): void {
    const missingInCompare = baseKeys.filter(key => !compareKeys.includes(key));
    if (missingInCompare.length > 0) {
        console.log(`Keys missing in ${compareLang} compared to ${baseLang}:`);
        missingInCompare.forEach(key => console.log(`  - ${key}`));
    }
}

function main(): void {
    const localeFolder = 'locales';
    const files = fs.readdirSync(localeFolder).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
        console.log("No JSON files found in the locales directory.");
        return;
    }

    // Load all JSON files
    const localeData: { [key: string]: any } = {};
    files.forEach(file => {
        const filePath = path.join(localeFolder, file);
        localeData[file] = loadJson(filePath);
    });

    // Get all keys for each locale
    const localeKeys: { [key: string]: string[] } = {};
    for (const file in localeData) {
        if (localeData.hasOwnProperty(file)) {
            localeKeys[file] = getAllKeys(localeData[file]);
        }
    }

    // Compare keys between each pair of locale files
    for (const baseFile in localeKeys) {
        if (localeKeys.hasOwnProperty(baseFile)) {
            for (const compareFile in localeKeys) {
                if (localeKeys.hasOwnProperty(compareFile) && baseFile !== compareFile) {
                    compareKeys(localeKeys[baseFile], localeKeys[compareFile], baseFile, compareFile);
                }
            }
        }
    }
}

main();
