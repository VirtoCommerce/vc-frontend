import { generate } from "@graphql-codegen/cli";

type ModuleType = {
  name: string;
  searchKey: string;
  apiPath: string;
  schemaPath: string;
};

const core = {
  apiPath: "client-app/core/api/graphql",
  schemaPath: `${process.env.APP_BACKEND_URL}/graphql`,
} as const;

// if a module does not have separated schema - use `core.schemaPath`
// if a module not used and not installed on The Platform - remove it to avoid console error
const independentModules: ModuleType[] = [
  {
    name: "PushMessages",
    searchKey: "PushMessages",
    apiPath: "client-app/modules/push-messages/api/graphql",
    schemaPath: `${process.env.APP_BACKEND_URL}/graphql/pushMessages`,
  },
  {
    name: "Quotes",
    searchKey: "QuoteType",
    apiPath: "client-app/modules/quotes/api/graphql",
    schemaPath: `${process.env.APP_BACKEND_URL}/graphql/quote`,
  },
  {
    name: "CustomerReviews",
    searchKey: "customerReviews",
    apiPath: "client-app/modules/customer-reviews/api/graphql",
    schemaPath: `${process.env.APP_BACKEND_URL}/graphql/customerReviews`,
  },
];

const CONFIG = {
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

const PLUGINS = [
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
  const typesPath = `${core.apiPath}/types.ts`;
  await generate(
    {
      schema: core.schemaPath,
      silent: true,
      documents: [
        addExtension(core.apiPath),
        // exclude independent modules from general modules
        ...independentModules.map((module) => `!${addExtension(module.apiPath)}`),
      ],
      generates: {
        [typesPath]: {
          plugins: PLUGINS,
          config: CONFIG,
        },
      },
    },
    true,
  );
  // eslint-disable-next-line no-console
  console.log(`Types for The Core have been generated in "${typesPath}\n"`);

  await Promise.allSettled(
    independentModules.map(async (module) => {
      const moduleTypesPath = `${module.apiPath}/types.ts`;
      try {
        await generate(
          {
            schema: module.schemaPath,
            silent: true,
            documents: addExtension(module.apiPath),
            generates: {
              [moduleTypesPath]: {
                plugins: PLUGINS,
                config: CONFIG,
              },
            },
          },
          true,
        );
        // eslint-disable-next-line no-console
        console.log(`Types for "${module.name}" module have been generated in "${moduleTypesPath}"\n`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error during types generation for "${module.name} module"\n`, err);
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
