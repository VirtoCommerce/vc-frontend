import { getMainDefinition } from "@apollo/client/utilities";
import type { Operation } from "@apollo/client/core";

export function isMutation(operation: Operation): boolean {
  const def = getMainDefinition(operation.query);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return def.kind === "OperationDefinition" && def.operation === "mutation";
}

export function defaultMergeVariables<TVars extends Record<string, unknown>>(a: TVars, b: TVars): TVars {
  return { ...a, ...b };
}
