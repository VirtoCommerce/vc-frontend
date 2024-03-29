import { relative } from "path";
import { GRAPHQL_DIRECTORY, GRAPHQL_TYPES_DIRECTORY } from "./client-app/core/constants/graphql";
import type { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenTypesConfig: CodegenConfig = {
  schema: `${GRAPHQL_DIRECTORY}/schema.json`,
  documents: ["client-app/**/*.(graphql|gql)"],
  generates: {
    [`${GRAPHQL_TYPES_DIRECTORY}/base.generated.ts`]: { plugins: ["typescript"] },
    [`${GRAPHQL_TYPES_DIRECTORY}/operations.generated.ts`]: {
      plugins: ["named-operations-object"],
      config: {
        identifierName: "OperationNames",
      },
    },
    "client-app/": {
      preset: "near-operation-file",
      presetConfig: {
        baseTypesPath: relative("client-app", `${GRAPHQL_TYPES_DIRECTORY}/base.generated.ts`),
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
