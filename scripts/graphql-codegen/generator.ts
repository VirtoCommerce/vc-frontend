import fs from "fs/promises";
import { generate } from "@graphql-codegen/cli";
import { SCHEMA_PATH } from "./schema";

const allModulesPath = "client-app/core/api/graphql";

type ModuleType = {
  name: string;
  searchKey: string;
  apiPath: string;
};

const independentModules: ModuleType[] = [
  {
    name: "PushMessages",
    searchKey: "PushMessages",
    apiPath: "client-app/core/api/graphql/push-messages",
  },
];

const GENERAL_CONFIG = {
  dedupeFragments: true,
  identifierName: "OperationNames",
  maybeValue: "T",
  scalars: {
    BigInt: "number",
    Byte: "number",
    Date: "string",
    DateOnly: "string",
    Decimal: "number",
    DynamicPropertyValue: "string | number | boolean | null",
    Guid: "string",
    Half: "number",
    Long: "number",
    Milliseconds: "number",
    ModuleSettingValue: "string | number | boolean | null",
    OptionalDecimal: "number | undefined",
    OptionalNullableDecimal: "number | null | undefined",
    OptionalString: "string | undefined",
    PropertyValue: "string | number | boolean | null",
    SByte: "number",
    Seconds: "number",
    Short: "number",
    TimeOnly: "string",
    UInt: "number",
    ULong: "number",
    Uri: "string",
    UShort: "number",
  },
  skipTypename: true,
  useTypeImports: true,
  skipGraphQLImport: true,
};

const GENERAL_PLUGINS = [
  {
    add: {
      content: "// This file is auto-generated. Do not edit manually.\n",
    },
  },
  "typescript",
  "typescript-operations",
  "typed-document-node",
  "named-operations-object",
];

async function runCodegen() {
  // eslint-disable-next-line no-console
  console.log("\nGenerate types for general modules:");
  const typesPath = `${allModulesPath}/types.ts`;
  await generate(
    {
      schema: SCHEMA_PATH,
      documents: [
        addExtension(allModulesPath),
        // exclude independent modules from general modules
        ...independentModules.map((module) => `!${addExtension(module.apiPath)}`),
      ],
      generates: {
        [typesPath]: {
          plugins: GENERAL_PLUGINS,
          config: GENERAL_CONFIG,
        },
      },
    },
    true,
  );
  // eslint-disable-next-line no-console
  console.log(`Types for general modules have been generated in "${typesPath}"`);

  const JSONString = await readJsonAndReturnString(SCHEMA_PATH);

  const installedIndependentModules = independentModules.filter((el) => JSONString?.includes(el.searchKey));

  if (installedIndependentModules.length) {
    // eslint-disable-next-line no-console
    console.log("\nGenerate types for independent modules:");
  }

  await Promise.allSettled(
    installedIndependentModules.map(async (module) => {
      const moduleTypesPath = `${module.apiPath}/types.ts`;
      try {
        await generate(
          {
            schema: SCHEMA_PATH,
            documents: addExtension(module.apiPath),
            generates: {
              [moduleTypesPath]: {
                plugins: GENERAL_PLUGINS,
                config: GENERAL_CONFIG,
              },
            },
          },
          true,
        );
        // eslint-disable-next-line no-console
        console.log(`Types for "${module.name}" module have been generated in "${moduleTypesPath}"`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error during types generation for "${module.name} module"`, err);
      }
    }),
  );
}

runCodegen().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

function addExtension(path: string): string {
  return `${path}/**/*.(graphql|gql)`;
}

async function readJsonAndReturnString(filePath: string) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const jsonData = JSON.parse(data);
    return JSON.stringify(jsonData);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error reading or parsing JSON:", err);
    return null;
  }
}
