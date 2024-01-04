declare module "apollo-upload-client/createUploadLink.mjs" {
  import type { ApolloLink } from "@apollo/client/core";

  interface IOptions {
    uri: string;
  }

  // eslint-disable-next-line no-restricted-exports
  export default function (options: IOptions): ApolloLink;
}
