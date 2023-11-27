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
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
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
      ],
      config: {
        dedupeFragments: true,
        maybeValue: "T",
        scalars: {
          Long: "number",
        },
        skipTypename: true,
        useTypeImports: true,
      },
    },
  },
};

export default graphQLCodegenTypesConfig;
