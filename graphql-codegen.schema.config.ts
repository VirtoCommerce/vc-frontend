import { GRAPHQL_DIRECTORY } from "./client-app/core/constants/graphql";
import type { CodegenConfig } from "@graphql-codegen/cli";

const graphQLCodegenSchemaConfig: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
  generates: {
    [`${GRAPHQL_DIRECTORY}/schema.json`]: {
      plugins: ["introspection"],
    },
  },
};

export default graphQLCodegenSchemaConfig;
