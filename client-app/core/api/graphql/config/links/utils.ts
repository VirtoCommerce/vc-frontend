import { getMainDefinition } from "@apollo/client/utilities";
import type { Operation } from "@apollo/client/core";

export function isMutation(operation: Operation): boolean {
  const def = getMainDefinition(operation.query);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return def.kind === "OperationDefinition" && def.operation === "mutation";
}

export function defaultMergeVariables<TVars extends Record<string, unknown>>(a: TVars, b: TVars): TVars {
  const result: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const [key, value] of Object.entries(b)) {
    const prev = result[key];
    if (Array.isArray(prev) && Array.isArray(value)) {
      result[key] = [...prev, ...value];
    } else if (
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const prevObj = prev as Record<string, unknown>;
      const valueObj = value as Record<string, unknown>;
      result[key] = { ...prevObj, ...valueObj };
    } else {
      result[key] = value;
    }
  }
  return result as TVars;
}
