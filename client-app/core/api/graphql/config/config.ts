import { configureCache } from "./cache";

export async function configureApolloClient() {
  await configureCache();
}
