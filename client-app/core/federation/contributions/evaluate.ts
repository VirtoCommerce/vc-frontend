import { Logger } from "@/core/utilities";
import type { ConditionNodeType } from "./types";

export interface IConditionContextType {
  /** A setting of the store module `module`, by name. */
  setting(module: string, key: string): unknown;
  /** A `settings_data.json` key. */
  themeSetting(key: string): unknown;
  isAuthenticated: boolean;
  can(permission: string): boolean;
}

/** Decided, or the field-only rest left for render time. */
export type ResidualConditionType = boolean | ConditionNodeType;

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (!warned.has(key)) {
    warned.add(key);
    Logger.warn(message);
  }
}

// `=== true`, like `useModuleSettings().isEnabled`.
function settingMatches(value: unknown, node: { eq?: unknown }): boolean {
  return "eq" in node ? value === node.eq : value === true;
}

/** Thrown, not read as false: under `not` a false turns into true, so an unreadable condition must cost its plugin. */
function malformed(node: unknown): never {
  throw new Error(`malformed condition ${JSON.stringify(node)}`);
}

function resolveLeaf(node: ConditionNodeType, context: IConditionContextType): ResidualConditionType | undefined {
  if ("setting" in node) {
    if (typeof node.module !== "string") {
      return malformed(node);
    }
    return settingMatches(context.setting(node.module, node.setting), node);
  }
  if ("themeSetting" in node) {
    return settingMatches(context.themeSetting(node.themeSetting), node);
  }
  if ("authenticated" in node) {
    return context.isAuthenticated;
  }
  if ("can" in node) {
    return context.can(node.can);
  }
  if ("field" in node) {
    return node;
  }
  return undefined;
}

/** `and`/`or`: a deciding operand ends it, the decided rest drops out, the undecided rest remains. */
function resolveJunction(
  operands: unknown,
  isAnd: boolean,
  context: IConditionContextType,
  node: ConditionNodeType,
): ResidualConditionType {
  if (!Array.isArray(operands)) {
    return malformed(node);
  }
  const rest: ConditionNodeType[] = [];
  for (const operand of operands as ConditionNodeType[]) {
    const value = resolveGlobalTerms(operand, context);
    if (value === !isAnd) {
      return value;
    }
    if (typeof value !== "boolean") {
      rest.push(value);
    }
  }
  if (rest.length <= 1) {
    return rest[0] ?? isAnd;
  }
  return isAnd ? { and: rest } : { or: rest };
}

/** Decides every global term and leaves `field` terms for render time. Throws on an unknown or malformed node. */
export function resolveGlobalTerms(node: ConditionNodeType, context: IConditionContextType): ResidualConditionType {
  if (node === null || typeof node !== "object") {
    return malformed(node);
  }
  const leaf = resolveLeaf(node, context);
  if (leaf !== undefined) {
    return leaf;
  }
  if ("not" in node) {
    const inner = resolveGlobalTerms(node.not, context);
    return typeof inner === "boolean" ? !inner : { not: inner };
  }
  if ("and" in node) {
    return resolveJunction(node.and, true, context, node);
  }
  if ("or" in node) {
    return resolveJunction(node.or, false, context, node);
  }
  throw new Error(`unknown condition key "${Object.keys(node).join('", "')}"`);
}

function readPath(context: unknown, path: string): unknown {
  let value: unknown = context;
  for (const segment of path.split(".")) {
    if (value === null || typeof value !== "object") {
      return undefined;
    }
    value = (value as Record<string, unknown>)[segment];
  }
  return value;
}

export function evaluateResidual(residual: ResidualConditionType, slotContext: unknown): boolean {
  if (typeof residual === "boolean") {
    return residual;
  }
  if ("field" in residual) {
    const value = readPath(slotContext, residual.field);
    return "eq" in residual ? value === residual.eq : Boolean(value);
  }
  if ("not" in residual) {
    return !evaluateResidual(residual.not, slotContext);
  }
  if ("and" in residual) {
    return residual.and.every((operand) => evaluateResidual(operand, slotContext));
  }
  if ("or" in residual) {
    return residual.or.some((operand) => evaluateResidual(operand, slotContext));
  }
  return false;
}

/** A field term cannot be decided here, so it does not gate. */
export function isGloballyTrue(node: ConditionNodeType | undefined, context: IConditionContextType): boolean {
  if (node === undefined) {
    return true;
  }
  const value = resolveGlobalTerms(node, context);
  if (typeof value === "boolean") {
    return value;
  }
  warnOnce(
    `field:${JSON.stringify(node)}`,
    `[MF] a field condition cannot gate this - ignoring it: ${JSON.stringify(node)}`,
  );
  return true;
}
