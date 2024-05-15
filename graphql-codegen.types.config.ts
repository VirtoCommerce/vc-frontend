/* eslint-disable @typescript-eslint/naming-convention */
import type { CodegenConfig } from "@graphql-codegen/cli";

// Workaround for missed field in CodegenConfig
// Types is a copy of not exported types from @graphql-codegen/cli with added field

interface CustomDocumentLoaderOptions {
  skipGraphQLImport?: boolean;
}

interface CustomDocumentLoader {
  [path: string]: CustomDocumentLoaderOptions;
}

type OperationDocument = CustomDocumentLoader;

type CodegenConfigWorkaround = { documents: OperationDocument | OperationDocument[] };

const graphQLCodegenTypesConfig: CodegenConfig | CodegenConfigWorkaround = {
  schema: `client-app/core/api/graphql/schema.json`,
  documents: {
    "client-app/**/*.(graphql|gql)": {
      skipGraphQLImport: false,
    },
  },
  generates: {
    "client-app/core/api/graphql/types.ts": {
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
      },
    },
  },
};

export default graphQLCodegenTypesConfig;
