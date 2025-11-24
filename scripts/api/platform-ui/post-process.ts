import { exec } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const GENERATED_DIR = resolve(process.cwd(), "client-app/core/api/platform-ui/generated/services");

async function replaceInFile(fileName: string, replacements: { search: string | RegExp; replace: string }[]) {
  const filePath = resolve(GENERATED_DIR, fileName);
  try {
    let content = await readFile(filePath, "utf-8");
    let changed = false;
    for (const { search, replace } of replacements) {
      if (RegExp(search).exec(content)) {
        content = content.replace(search, replace);
        changed = true;
      }
    }
    if (changed) {
      await writeFile(filePath, content, "utf-8");
      console.log(`Processed ${fileName}`);
    } else {
      console.log(`No changes needed for ${fileName}`);
    }
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
  }
}

async function removeDuplicateImports(fileName: string) {
  const filePath = resolve(GENERATED_DIR, fileName);
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const seenImports = new Set<string>();
    const filteredLines: string[] = [];
    let changed = false;

    for (const line of lines) {
      if (line.startsWith("import type {") || line.startsWith("import {")) {
        if (seenImports.has(line)) {
          changed = true;
          continue;
        }
        seenImports.add(line);
      }
      filteredLines.push(line);
    }

    if (changed) {
      await writeFile(filePath, filteredLines.join("\n"), "utf-8");
      console.log(`Removed duplicate imports from ${fileName}`);
    }
  } catch (error) {
    console.error(`Error removing duplicate imports from ${fileName}:`, error);
  }
}

export async function run() {
  // Fix AssetsManagementService.ts
  await replaceInFile("AssetsManagementService.ts", [
    {
      search: /assetEntryGet\(\{\s*id,\s*id,\s*\}\s*:\s*\{\s*id:\s*string,\s*id\?:\s*string,\s*\}\)/,
      replace: `assetEntryGet({
        id,
        queryId,
    }: {
        id: string,
        queryId?: string,
    })`,
    },
    {
      search: /query:\s*\{\s*'id':\s*id,\s*\}/,
      replace: `query: {
                'id': queryId,
            }`,
    },
  ]);

  // Fix TcsOffersSearchModuleService.ts
  await replaceInFile("TcsOffersSearchModuleService.ts", [
    // Rename customerId to customerObjId in destructuring (matches both methods)
    {
      search: /customerShouldSerializeAuditableProperties,\s*customerId,/g,
      replace: "customerShouldSerializeAuditableProperties,\n        customerObjId,",
    },
    // Rename customerId to customerObjId in type definition (matches both methods)
    {
      search: /customerShouldSerializeAuditableProperties\?:\s*boolean,\s*customerId\?:\s*string,/g,
      replace: "customerShouldSerializeAuditableProperties?: boolean,\n        customerObjId?: string,",
    },
    // Update the query mapping
    {
      search: /'Customer\.Id':\s*customerId,/g,
      replace: "'Customer.Id': customerObjId,",
    },
  ]);

  // Fix TcsScheduleTransportModuleService.ts
  await replaceInFile("TcsScheduleTransportModuleService.ts", [
    {
      search:
        /Travel_TransportModule_Core_Model_ScheduleItem_Travel_Transport_Core_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_/g,
      replace: "Travel_TransportModule_Core_Model_ScheduleItem",
    },
  ]);

  // Fix TravelAccountInfoModuleService.ts
  await replaceInFile("TravelAccountInfoModuleService.ts", [
    {
      search:
        /Travel_AccountInfoModule_Core_Models_AccountActivityRecord_Travel_AccountInfoModule_Core_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_/g,
      replace: "Travel_AccountInfoModule_Core_Models_AccountActivityRecord",
    },
  ]);
  await removeDuplicateImports("TravelAccountInfoModuleService.ts");

  // Fix TravelOfferSearchAdvancedModuleService.ts
  await replaceInFile("TravelOfferSearchAdvancedModuleService.ts", [
    {
      search:
        /Travel_AdvancedOfferModule_Core_Model_Summary_SummarySearchResultItem_Travel_AdvancedOfferModule_Core_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_/g,
      replace: "Travel_AdvancedOfferModule_Core_Model_Summary_SummarySearchResultItem",
    },
  ]);
}

async function checkForErrors(): Promise<void> {
  console.log("\nChecking for TypeScript errors in generated files...");
  try {
    const { stdout } = await execAsync('yarn vue-tsc --noEmit 2>&1 | grep "client-app/core/api/platform-ui/" || true');
    const errors = stdout.trim();
    if (errors) {
      console.error("\n⚠️  TypeScript errors found in generated files:");
      console.error(errors);
      console.error("\n❌ Post-processing completed with errors. Please review the output above.");
      process.exit(1);
    } else {
      console.log("✅ No TypeScript errors found in generated files.");
    }
  } catch (error) {
    console.error("Error checking for TypeScript errors:", error);
    process.exit(1);
  }
}

export async function runWithValidation() {
  await run();
  await checkForErrors();
}
