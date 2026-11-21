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
export function filterSectionCss(type: string, css: string): IFilteredCss | undefined {
  const sheet = parseStyleSheet(css);

  if (!sheet) {
    return undefined;
  }

  const keyframes: string[] = [];
  const rules: string[] = [];

  for (const rule of sheet.cssRules) {
    if (isRuleOf(rule, "CSSKeyframesRule")) {
      const keyframesRule = rule as CSSKeyframesRule;

      if (keyframesRule.name.startsWith(`${type}__`)) {
        [...keyframesRule.cssRules].forEach((keyframe) => filterDeclarations((keyframe as CSSKeyframeRule).style));
        keyframes.push(keyframesRule.cssText);
      }
    } else if (keepRule(rule)) {
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

function keepRule(rule: CSSRule): boolean {
  if (isRuleOf(rule, "CSSStyleRule")) {
    const styleRule = rule as CSSStyleRule;

    if (REFUSED_SELECTOR_REGEX.test(styleRule.selectorText)) {
      return false;
    }

    filterDeclarations(styleRule.style);
    filterRules(styleRule);
    return true;
  }

  if (isRuleOf(rule, "CSSNestedDeclarations")) {
    filterDeclarations((rule as CSSRule & { style: CSSStyleDeclaration }).style);
    return true;
  }

  if (CONDITION_RULES.some((name) => isRuleOf(rule, name))) {
    filterRules(rule as CSSGroupingRule);
    return true;
  }

  return false;
}

/** Nested rules too: a style rule holds them with CSS nesting. */
function filterRules(owner: Partial<RuleOwnerType>): void {
  if (!owner.cssRules || typeof owner.deleteRule !== "function") {
    return;
  }

  for (let index = owner.cssRules.length - 1; index >= 0; index--) {
    if (!keepRule(owner.cssRules[index])) {
      owner.deleteRule(index);
    }
  }
}

function filterDeclarations(style: CSSStyleDeclaration): void {
  for (const property of Array.from(style)) {
    if (!isAllowedDeclaration(property.toLowerCase(), style.getPropertyValue(property))) {
      style.removeProperty(property);
    }
  }
}

function isAllowedDeclaration(property: string, value: string): boolean {
  if (REFUSED_PROPERTIES.has(property)) {
    return false;
  }

  // No `fixed`, also not through `var()`, `env()` or `if()`.
  if (property === "position" && !POSITION_VALUES.has(decodeCssEscapes(value).trim().toLowerCase())) {
    return false;
  }

  return isAllowedValue(value);
}

/** By the browser's own classes, which an older browser may not have. */
function isRuleOf(rule: CSSRule, name: string): boolean {
  const ruleClass = (globalThis as unknown as Record<string, unknown>)[name];
  return typeof ruleClass === "function" && rule instanceof ruleClass;
}
