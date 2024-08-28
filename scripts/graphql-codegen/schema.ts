import type { CodegenConfig } from "@graphql-codegen/cli";

const GQL_SERVER_URI = `${process.env.APP_BACKEND_URL}graphql`;
export const SCHEMA_PATH = "client-app/core/api/graphql/schema.json";

// eslint-disable-next-line no-console
console.log(`Downloading schema from ${GQL_SERVER_URI} to ${SCHEMA_PATH}`);

const schema: CodegenConfig = {
  schema: GQL_SERVER_URI,
  generates: {
    [SCHEMA_PATH]: {
      plugins: ["introspection"],
    },
  },
};

// eslint-disable-next-line no-restricted-exports
export default schema;
