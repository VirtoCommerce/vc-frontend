import fs from "fs/promises";
import { generate } from "@graphql-codegen/cli";
import { SCHEMA_PATH } from "./schema";

const allModulesPath = "client-app/core/api/graphql";

const independentModules = [
  {
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
  await generate(
    {
      schema: SCHEMA_PATH,
      documents: [
        addExtension(allModulesPath),
        ...independentModules.map((module) => `!${addExtension(module.apiPath)}`),
      ],
      generates: {
        [`${allModulesPath}/types.ts`]: {
          plugins: GENERAL_PLUGINS,
          config: GENERAL_CONFIG,
        },
      },
    },
    true,
  );

  const JSONString = await readJsonAndReturnString(SCHEMA_PATH);

  const installedIndependentModules = independentModules.filter((el) => JSONString?.includes(el.searchKey));

  for (let i = 0; i < installedIndependentModules.length; i++) {
    const module = independentModules[i];

    await generate(
      {
        schema: SCHEMA_PATH,
        documents: addExtension(module.apiPath),
        generates: {
          [`${module.apiPath}/types.ts`]: {
            plugins: GENERAL_PLUGINS,
            config: GENERAL_CONFIG,
          },
        },
      },
      true,
    );
  }
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
