import { generate } from "@graphql-codegen/cli";

const services = ["client-app/**/push-messages/**/*.graphql"];

const SCHEMA_PATH = "client-app/core/api/graphql/schema.json";

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
      documents: ["client-app/**/*.(graphql|gql)", ...services.map((el) => "!" + el)],
      generates: {
        "client-app/core/api/graphql/types.ts": {
          plugins: GENERAL_PLUGINS,
          config: GENERAL_CONFIG,
        },
      },
    },
    true,
  );

  await generate(
    {
      schema: SCHEMA_PATH,
      documents: "client-app/**/push-messages/**/*.graphql",
      generates: {
        "client-app/core/api/graphql/push-messages/types.ts": {
          plugins: GENERAL_PLUGINS,
          config: GENERAL_CONFIG,
        },
      },
    },
    true,
  );
}

runCodegen().catch((err) => {
  console.error(err);
});
