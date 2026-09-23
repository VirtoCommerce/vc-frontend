import { Logger } from "@/core/utilities";
import type { ConditionNodeType } from "./types";

/** What the host knows before any plugin runs: the moment module `init()` runs today. */
export interface IConditionContextType {
  /** A module setting of the store, looked up by its name across all modules. */
  setting(key: string): unknown;
  /** A key of the theme's `settings_data.json`. */
  themeSetting(key: string): unknown;
  isAuthenticated: boolean;
  can(permission: string): boolean;
}

/** A field-only condition left for render time, or the answer already. */
export type ResidualConditionType = boolean | ConditionNodeType;

const warned = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (!warned.has(key)) {
    warned.add(key);
    Logger.warn(message);
  }
}

/**
 * Settings follow the host's own convention (`useModuleSettings().isEnabled` is `=== true`), so
 * declaring `settingEnabled(ENABLED_KEY)` means exactly what the module's own check means.
 */
function settingMatches(value: unknown, node: { eq?: unknown }): boolean {
  return "eq" in node ? value === node.eq : value === true;
}

function malformed(node: unknown): false {
  warnOnce(`shape:${JSON.stringify(node)}`, `[MF] ignoring a malformed condition ${JSON.stringify(node)}`);
  return false;
}

/** A global leaf's answer, the field leaf itself, or `undefined` when `node` is not a leaf. */
function resolveLeaf(node: ConditionNodeType, context: IConditionContextType): ResidualConditionType | undefined {
  if ("setting" in node) {
    return settingMatches(context.setting(node.setting), node);
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

/**
 * Resolves every global term against `context` and leaves the `field` terms standing, so a slot's
 * condition is decided once for everything that does not depend on the item and per render for
 * what does. An unknown node is logged once and counts as false: a declaration from a newer
 * format must not make the host reserve boxes or register routes it cannot justify.
 */
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
  warnOnce(
    `key:${Object.keys(node).join(",")}`,
    `[MF] ignoring a condition with an unknown key: ${JSON.stringify(node)}`,
  );
  return false;
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

/** A residual from `resolveGlobalTerms`, decided against one render's slot context. */
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
  // Global terms never survive resolveGlobalTerms; anything else is not a condition.
  return false;
}

/** For the plugin, a route or a menu entry: a field term there cannot be decided, so it does not gate. */
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
