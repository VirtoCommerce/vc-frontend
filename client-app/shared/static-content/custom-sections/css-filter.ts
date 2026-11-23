import { SECTION_TYPE_ATTRIBUTE } from "./constants";
import { isContainedSelector } from "./css-selectors";
import { decodeCssEscapes, isAllowedValue } from "./css-values";
import { MAX_CSS_DEPTH } from "./limits";

export interface IFilteredCss {
  /**
   * A keyframes name is not scoped, so it starts with `{type}__`, and each is emitted once beside the scope, as the
   * contract does; one written inside a condition keeps it.
   */
  keyframes: string;
  rules: string;
}

interface IFilterContext {
  type: string;
  assetsBaseUrl: string | undefined;
}

interface IRuleOwner {
  cssRules: CSSRuleList;
  deleteRule(index: number): void;
}

const CONDITION_RULES = ["CSSMediaRule", "CSSSupportsRule", "CSSContainerRule", "CSSStartingStyleRule"];
const REFUSED_PROPERTIES = new Set(["behavior", "-moz-binding"]);
const POSITION_VALUES = new Set(["static", "relative", "absolute", "sticky", "inherit", "initial", "unset", "revert"]);
const SCOPE_PRELUDE = `@scope ([${SECTION_TYPE_ATTRIBUTE}])`;
/** `:root`, and `html` or `body` as a type selector, a namespace prefix included. */
const REFUSED_SELECTOR_REGEX = /:root(?![\w-])|(?:^|[\s>+~,(|])(?:html|body)(?![\w-])/i;
/** A pseudo-class or -element whose argument is a name, not a selector: `::part(body)` names no element. */
const NAME_ARGUMENT_REGEX = /::?(?:part|state)\([^)]*\)/gi;

/**
 * Keeps the at-rules and declarations the custom section contract allows, as the browser parsed them.
 * `undefined` where the browser cannot parse a stylesheet on its own: the section then has no CSS.
 */
export function filterSectionCss(type: string, css: string, assetsBaseUrl?: string): IFilteredCss | undefined {
  const sheet = parseScoped(css);

  if (!sheet) {
    return undefined;
  }

  const context: IFilterContext = { type, assetsBaseUrl };
  const keyframes: string[] = [];
  const rules: string[] = [];

  for (const rule of sheet.cssRules) {
    if (isRuleOf<CSSKeyframesRule>(rule, "CSSKeyframesRule")) {
      if (keepKeyframes(rule, context)) {
        keyframes.push(rule.cssText);
      }
    } else if (keepRule(rule, context, true, 1)) {
      const conditionalKeyframes = takeKeyframes(rule);

      if (conditionalKeyframes) {
        keyframes.push(conditionalKeyframes);
      }
      rules.push(rule.cssText);
    }
  }

  return { keyframes: keyframes.join("\n"), rules: rules.join("\n") };
}

/**
 * Read in the scope it is put in, where a relative selector such as `> .card` is a rule; at the top level the
 * browser drops it. What a stray `}` lets out of the wrapper is not read.
 */
function parseScoped(css: string): IRuleOwner | undefined {
  if (typeof CSSScopeRule === "undefined") {
    return parseStyleSheet(css);
  }

  const [scope] = parseStyleSheet(`${SCOPE_PRELUDE} {\n${css}\n}`)?.cssRules ?? [];
  return scope && isRuleOf<CSSScopeRule>(scope, "CSSScopeRule") ? scope : undefined;
}

function parseStyleSheet(css: string): CSSStyleSheet | undefined {
  if (typeof CSSStyleSheet === "undefined" || typeof CSSStyleSheet.prototype.replaceSync !== "function") {
    return undefined;
  }

  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    return sheet;
  } catch {
    return undefined;
  }
}

/** `canHoldKeyframes`: only condition rules stand between the rule and the top level. `depth`: 1 at the top level. */
function keepRule(rule: CSSRule, context: IFilterContext, canHoldKeyframes: boolean, depth: number): boolean {
  if (depth > MAX_CSS_DEPTH) {
    return false;
  }

  if (isRuleOf<CSSStyleRule>(rule, "CSSStyleRule")) {
    if (
      REFUSED_SELECTOR_REGEX.test(rule.selectorText.replaceAll(NAME_ARGUMENT_REGEX, "")) ||
      !isContainedSelector(rule.selectorText)
    ) {
      return false;
    }

    filterDeclarations(rule.style, context.assetsBaseUrl);
    filterRules(rule, context, false, depth + 1);
    return true;
  }

  if (isRuleOf(rule, "CSSNestedDeclarations") && hasStyle(rule)) {
    filterDeclarations(rule.style, context.assetsBaseUrl);
    return true;
  }

  // `@starting-style` holds style rules only: keyframes go in no condition but `@media`, `@supports` or `@container`.
  if (isConditionRule(rule)) {
    filterRules(rule, context, canHoldKeyframes && !isRuleOf(rule, "CSSStartingStyleRule"), depth + 1);
    return true;
  }

  return canHoldKeyframes && isRuleOf<CSSKeyframesRule>(rule, "CSSKeyframesRule") && keepKeyframes(rule, context);
}

/** Nested rules too: a style rule holds them with CSS nesting. `depth`: that of the owner's rules. */
function filterRules(
  owner: Partial<IRuleOwner>,
  context: IFilterContext,
  canHoldKeyframes: boolean,
  depth: number,
): void {
  if (!owner.cssRules || typeof owner.deleteRule !== "function") {
    return;
  }

  for (let index = owner.cssRules.length - 1; index >= 0; index--) {
    if (!keepRule(owner.cssRules[index], context, canHoldKeyframes, depth)) {
      owner.deleteRule(index);
    }
  }
}

function keepKeyframes(rule: CSSKeyframesRule, context: IFilterContext): boolean {
  if (!rule.name.startsWith(`${context.type}__`)) {
    return false;
  }

  [...rule.cssRules].filter(hasStyle).forEach((keyframe) => filterDeclarations(keyframe.style, context.assetsBaseUrl));
  return true;
}

/** Takes the keyframes out of a condition rule, returned inside a copy of the conditions that hold them. */
function takeKeyframes(rule: CSSRule): string | undefined {
  if (!isConditionRule(rule) || !holdsKeyframes(rule)) {
    return undefined;
  }

  const copy = parseStyleSheet(rule.cssText);
  pruneRules(rule, (child) => !isKeyframesRule(child));

  if (!copy) {
    return undefined;
  }

  pruneRules(copy, (child) => isKeyframesRule(child) || (isConditionRule(child) && holdsKeyframes(child)));
  return [...copy.cssRules].map(({ cssText }) => cssText).join("\n");
}

/** Keeps the rules `isKept` takes, looking into the condition rules it keeps. */
function pruneRules(owner: Partial<IRuleOwner>, isKept: (rule: CSSRule) => boolean): void {
  if (!owner.cssRules || typeof owner.deleteRule !== "function") {
    return;
  }

  for (let index = owner.cssRules.length - 1; index >= 0; index--) {
    const rule = owner.cssRules[index];

    if (!isKept(rule)) {
      owner.deleteRule(index);
    } else if (isConditionRule(rule)) {
      pruneRules(rule, isKept);
    }
  }
}

function holdsKeyframes(owner: CSSGroupingRule): boolean {
  return [...owner.cssRules].some((rule) => isKeyframesRule(rule) || (isConditionRule(rule) && holdsKeyframes(rule)));
}

function isKeyframesRule(rule: CSSRule): boolean {
  return isRuleOf(rule, "CSSKeyframesRule");
}

function filterDeclarations(style: CSSStyleDeclaration, assetsBaseUrl: string | undefined): void {
  for (const property of Array.from(style)) {
    if (!isAllowedDeclaration(property.toLowerCase(), style.getPropertyValue(property), assetsBaseUrl)) {
      style.removeProperty(property);
    }
  }

  // A shorthand holding `var()` keeps its value as written while its longhands read empty, so the block is checked whole.
  if (!isAllowedValue(style.cssText, assetsBaseUrl)) {
    style.cssText = "";
  }
}

function isAllowedDeclaration(property: string, value: string, assetsBaseUrl: string | undefined): boolean {
  if (REFUSED_PROPERTIES.has(property)) {
    return false;
  }

  // No `fixed`, also not through `var()`, `env()` or `if()`.
  if (property === "position" && !POSITION_VALUES.has(decodeCssEscapes(value).trim().toLowerCase())) {
    return false;
  }

  return isAllowedValue(value, assetsBaseUrl);
}

/** By the browser's own classes, which an older browser may not have. */
function isRuleOf<T extends CSSRule>(rule: CSSRule, name: string): rule is T {
  const ruleClass = (globalThis as unknown as Record<string, unknown>)[name];
  return typeof ruleClass === "function" && rule instanceof ruleClass;
}

function hasStyle(rule: CSSRule): rule is CSSRule & { style: CSSStyleDeclaration } {
  return "style" in rule && rule.style instanceof CSSStyleDeclaration;
}

function isConditionRule(rule: CSSRule): rule is CSSGroupingRule {
  return CONDITION_RULES.some((name) => isRuleOf(rule, name));
}
