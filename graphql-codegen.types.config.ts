import type { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenTypesConfig: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
  documents: "client-app/**/*.(graphql|gql)",
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
        skipTypename: true,
        maybeValue: "T",
        scalars: {
          Long: "number",
        },
      },
    },
  },
};

export default graphQLCodegenTypesConfig;
