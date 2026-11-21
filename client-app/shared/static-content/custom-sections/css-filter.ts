import { decodeCssEscapes, isAllowedValue } from "./css-values";

export interface IFilteredCss {
  /** Top level: a keyframes name is not scoped, so it starts with `{type}__`. */
  keyframes: string;
  rules: string;
}

type RuleOwnerType = { cssRules: CSSRuleList; deleteRule(index: number): void };

const CONDITION_RULES = ["CSSMediaRule", "CSSSupportsRule", "CSSContainerRule", "CSSStartingStyleRule"];
const REFUSED_PROPERTIES = new Set(["behavior", "-moz-binding"]);
const POSITION_VALUES = new Set(["static", "relative", "absolute", "sticky", "inherit", "initial", "unset", "revert"]);
const REFUSED_SELECTOR_REGEX = /:root(?![\w-])|(?:^|[\s>+~,(])(?:html|body)(?![\w-])/i;

/**
 * Keeps the at-rules and declarations the custom section contract allows, as the browser parsed them.
 * `undefined` where the browser cannot parse a stylesheet on its own: the section then has no CSS.
 */
export function filterSectionCss(type: string, css: string, assetsBaseUrl?: string): IFilteredCss | undefined {
  const sheet = parseStyleSheet(css);

  if (!sheet) {
    return undefined;
  }

  const keyframes: string[] = [];
  const rules: string[] = [];

  for (const rule of sheet.cssRules) {
    if (isRuleOf<CSSKeyframesRule>(rule, "CSSKeyframesRule")) {
      if (rule.name.startsWith(`${type}__`)) {
        [...rule.cssRules].filter(hasStyle).forEach((keyframe) => filterDeclarations(keyframe.style, assetsBaseUrl));
        keyframes.push(rule.cssText);
      }
    } else if (keepRule(rule, assetsBaseUrl)) {
      rules.push(rule.cssText);
    }
  }

  return { keyframes: keyframes.join("\n"), rules: rules.join("\n") };
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

function keepRule(rule: CSSRule, assetsBaseUrl: string | undefined): boolean {
  if (isRuleOf<CSSStyleRule>(rule, "CSSStyleRule")) {
    if (REFUSED_SELECTOR_REGEX.test(rule.selectorText)) {
      return false;
    }

    filterDeclarations(rule.style, assetsBaseUrl);
    filterRules(rule, assetsBaseUrl);
    return true;
  }

  if (isRuleOf(rule, "CSSNestedDeclarations") && hasStyle(rule)) {
    filterDeclarations(rule.style, assetsBaseUrl);
    return true;
  }

  if (isConditionRule(rule)) {
    filterRules(rule, assetsBaseUrl);
    return true;
  }

  return false;
}

/** Nested rules too: a style rule holds them with CSS nesting. */
function filterRules(owner: Partial<RuleOwnerType>, assetsBaseUrl: string | undefined): void {
  if (!owner.cssRules || typeof owner.deleteRule !== "function") {
    return;
  }

  for (let index = owner.cssRules.length - 1; index >= 0; index--) {
    if (!keepRule(owner.cssRules[index], assetsBaseUrl)) {
      owner.deleteRule(index);
    }
  }
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
