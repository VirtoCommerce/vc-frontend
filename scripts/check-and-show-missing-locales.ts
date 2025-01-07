import groupBy from "lodash/groupBy";
import { main as checkLocales } from "./check-locales-missing-keys";
import type { MissingKeyType } from "./check-locales-missing-keys";

function showMissingKeys(missingKeys: MissingKeyType[]) {
  const groupedByLanguages = groupBy(missingKeys, ({ originFile, targetFile }) => `${originFile}|${targetFile}`);
  Object.entries(groupedByLanguages).forEach(([languages, keys]) => {
    const [originFile, targetFile] = languages.split("|");
    console.warn(`Warning: Keys missing in ${targetFile} compared to ${originFile}:`);
    keys.forEach((key) => console.warn(`  - ${key.key}`));
  });
}

showMissingKeys(checkLocales());
