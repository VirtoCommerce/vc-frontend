import { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenTypesConfig: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
  documents: "client-app/**/*.(graphql|gql)",
  generates: {
    "client-app/core/api/graphql/types.ts": {
      plugins: [
        {
          add: {
            content:
              '// This file was generated based on "codegen.types.ts". Do not edit manually.\n\n' +
              "/* eslint-disable */\n",
          },
        },
        "typescript",
        "typescript-operations",
      ],
      config: {
        skipTypename: true,
        maybeValue: "T",
      },
    },
  },
};

export default graphQLCodegenTypesConfig;
