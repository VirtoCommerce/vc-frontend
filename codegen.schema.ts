import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: `${process.env.APP_BACKEND_URL}/xapi/graphql`,
  generates: {
    "client-app/xapi/schema.json": {
      plugins: ["introspection"],
      config: {
        descriptions: false,
      },
    },
  },
};

export default config;
