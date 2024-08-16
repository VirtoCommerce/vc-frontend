/* eslint-disable @typescript-eslint/naming-convention */
import type { CodegenConfig } from "@graphql-codegen/cli";

// const services = ["client-app/**/push-messages/**/*.graphql"];

const graphqlCodegenGeneralTypesConfig: CodegenConfig = {
  schema: `client-app/core/api/graphql/schema.json`,
  documents: "client-app/core/api/graphql/push-messages/**/*.graphql",
  generates: {
    "client-app/core/api/graphql/push-messages/types.ts": {
      plugins: [
        {
          add: {
            content: "// This file is auto-generated. Do not edit manually.\n",
          },
        },
        "typescript",
        "typescript-operations",
        "typed-document-node",
        "named-operations-object",
      ],
    },
  },
  config: {
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
    // documentsAsTypes: true,
  },
};

export default graphqlCodegenGeneralTypesConfig;
