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
          Long: "number",
          OptionalString: "string | undefined",
        },
        skipTypename: true,
        useTypeImports: true,
      },
    },
  },
};

export default graphQLCodegenTypesConfig;
