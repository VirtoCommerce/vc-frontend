declare module "*.graphql" {
  import type { DocumentNode } from "graphql";
  const defaultDocument: DocumentNode;
  export default defaultDocument;
}
