import type { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenTypesConfig: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
  documents: ["client-app/**/*.(graphql|gql)"],
  generates: {
    "client-app/core/api/graphql/types/base.generated.ts": { plugins: ["typescript"] },
    "client-app/core/api/graphql/types/operations.generated.ts": {
      plugins: ["named-operations-object"],
      config: {
        identifierName: "OperationNames",
      },
    },
    "client-app/core/api/graphql/": {
      preset: "near-operation-file",
      presetConfig: {
        baseTypesPath: "types/base.generated.ts",
        extensions: ".generated.ts",
      },
      plugins: ["typescript-operations", "typed-document-node"],
    },
  },
  config: {
    dedupeFragments: true,
    inlineFragmentTypes: "combine",
    maybeValue: "T",
    scalars: {
      Long: "number",
      OptionalString: "string | undefined",
    },
    skipTypename: true,
    useTypeImports: true,
  },
};

export default graphQLCodegenTypesConfig;
