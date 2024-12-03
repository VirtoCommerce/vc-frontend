import fs from "fs/promises";
import { generate } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";
import type { CodegenConfig } from "@graphql-codegen/cli";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

type ModuleType = {
  name: string;
  searchKey: string;
  apiPath: string;
  schemaPath?: string;
};

const core = {
  apiPath: "client-app/core/api/graphql",
  schemaPath: "client-app/core/api/graphql/schema.json",
} as const;

const independentModules: ModuleType[] = [
  {
    name: "PushMessages",
    searchKey: "PushMessages",
    apiPath: "client-app/modules/push-messages/api/graphql",
  },
  {
    name: "Quotes",
    searchKey: "QuoteType",
    apiPath: "client-app/modules/quotes/api/graphql",
  },
  {
    name: "CustomerReviews",
    searchKey: "customerReviews",
    apiPath: "client-app/modules/customer-reviews/api/graphql",
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
  await downloadSchema(`${process.env.APP_BACKEND_URL}/graphql`, core.schemaPath);

  // eslint-disable-next-line no-console
  console.log("\nGenerate types for general modules:");
  const typesPath = `${core.apiPath}/types.ts`;
  await generate(
    {
      schema: core.schemaPath,
      documents: [
        addExtension(core.apiPath),
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

  const JSONString = await readJsonAndReturnString(core.schemaPath);

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
            schema: core.schemaPath,
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

async function downloadSchema(schemaUrl: string, schemaPath: string) {
  const schema: CodegenConfig = {
    schema: schemaUrl,
    generates: {
      [schemaPath]: {
        plugins: ["introspection"],
      },
    },
  };

  // eslint-disable-next-line no-console
  console.log(`Downloading schema from ${schemaUrl} to ${schemaPath}`);
  await generate(schema, true);
}
