import { ApolloLink } from "@apollo/client/core";
import { useModules } from "@/core/composables/useModules";
import { applyGates } from "./apply-gates";

/**
 * Rewrites every outgoing GraphQL operation to drop selections marked with
 * `@gate(module: "...")` when the referenced backend module is not installed.
 *
 * Module list is sourced from `useModules`, which is populated by the bootstrap
 * `initializeApplication` query before any gated query is fired.
 */
export const applyGatesLink = new ApolloLink((operation, forward) => {
  const { installedModuleIds } = useModules();
  operation.query = applyGates(operation.query, installedModuleIds.value);
  return forward(operation);
});
