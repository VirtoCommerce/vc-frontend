import type { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenSchemaConfig: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/graphql`,
  generates: {
    "client-app/core/api/graphql/schema.json": {
      plugins: ["introspection"],
      config: {
        descriptions: false,
      },
    },
  },
};

export default graphQLCodegenSchemaConfig;
