import { isRecord } from "@/core/utilities";
import {
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES,
} from "@/shared/catalog/constants/product";
import type { ITemplateCondition, ITemplateSubject } from "./conditions";
import type { ITemplateRule, ITemplateRules, IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";

export const PAGE_TYPES: readonly ThemePageType[] = ["product", "category", "page"];

/** The rules a page type gets when the theme's rules have no list for it. */
export const DEFAULT_TEMPLATE_RULES: Readonly<Record<ThemePageType, ITemplateRule[]>> = {
  product: [
    {
      id: "default-b2c",
      template: "product.b2c",
      when: {
        property: {
          name: PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
          equals: PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c,
        },
      },
    },
  ],
  category: [],
  page: [],
};

/** A template the page's rules pick, and the rule that picks it. */
export interface ITemplatePick {
  template: string;
  /** `null` for the page's own template, the page type's template or a built-in one. */
  ruleId: string | null;
}

export interface ITemplateResolution {
  pageType: ThemePageType;
  /** The template key rendered: the template the designer has open, else the rules' pick. */
  template: string;
  /** The rule that chose it; `null` for an open template, the page's own template, the page type's or a built-in one. */
  ruleId: string | null;
  document: IThemePageDocument;
  /** What the rules pick for the page, whichever template the designer has open. */
  rules: ITemplatePick;
}

/** A choice of the rules alone: the template it picks is the one rendered. */
export type TemplateChoiceType = Omit<ITemplateResolution, "rules">;

export interface ITemplateChoiceOptions {
  pageType: ThemePageType;
  subject: ITemplateSubject;
  rules: ITemplateRules | undefined;
  /** The theme's templates over the built-in ones, by key. */
  templates: Readonly<Record<string, IThemePageDocument>>;
  getCondition: (name: string) => ITemplateCondition | undefined;
  /** A content page's own `settings.template`. */
  ownTemplate?: unknown;
}

/** The page type a template key is for: `product.b2c` → `product`. */
export function getTemplatePageType(key: string): string {
  return key.split(".")[0];
}

/**
 * Picks a page's template synchronously: the page's own template when it names one of its page type, else the first
 * enabled rule whose every condition holds, else the template keyed by the page type. A rule naming a template that
 * does not exist is skipped; a condition the storefront does not know never holds.
 */
export function chooseTemplate(options: ITemplateChoiceOptions): TemplateChoiceType | undefined {
  const { pageType, subject, rules, templates, getCondition, ownTemplate } = options;

  if (
    typeof ownTemplate === "string" &&
    getTemplatePageType(ownTemplate) === pageType &&
    Object.hasOwn(templates, ownTemplate)
  ) {
    return { pageType, template: ownTemplate, ruleId: null, document: templates[ownTemplate] };
  }

  const list = rules?.[pageType] ?? DEFAULT_TEMPLATE_RULES[pageType];
  const rule = list.find(
    (item) =>
      !item.disabled &&
      getTemplatePageType(item.template) === pageType &&
      Object.hasOwn(templates, item.template) &&
      Object.entries(item.when ?? {}).every(
        ([name, value]) =>
          getCondition(name)?.pageTypes.includes(pageType) && getCondition(name)?.evaluate(subject, value),
      ),
  );

  if (rule) {
    return { pageType, template: rule.template, ruleId: rule.id, document: templates[rule.template] };
  }

  return Object.hasOwn(templates, pageType)
    ? { pageType, template: pageType, ruleId: null, document: templates[pageType] }
    : undefined;
}

/**
 * Reads a rules file: `version` 2 as it is, `version` 1 (no ids) with `{pageType}-{index}` as the ids. Anything else is
 * not a rules file. `conditions` is read when it is there and never needed.
 */
export function normalizeTemplateRules(value: unknown): ITemplateRules | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const rules: ITemplateRules = {
    version: 2,
    conditions: Array.isArray(value.conditions)
      ? value.conditions.filter((name): name is string => typeof name === "string")
      : undefined,
  };

  for (const pageType of PAGE_TYPES) {
    const list = value[pageType];

    if (Array.isArray(list)) {
      rules[pageType] = withUniqueIds(list.filter(isRuleLike), pageType);
    }
  }

  return rules;
}

/**
 * Gives a rule without an id, or with the id of a rule before it, `{pageType}-{index}` (its index among the rules
 * read), else `{pageType}-{index}-{n}` with the first `n` from 2 that no rule before it has, as the module's snapshot
 * builder does: `resolved.ruleId` names the same rule on both sides.
 */
function withUniqueIds(
  list: (Omit<ITemplateRule, "id"> & { id?: unknown })[],
  pageType: ThemePageType,
): ITemplateRule[] {
  const ids = new Set<string>();

  return list.map((rule, index) => {
    let id = typeof rule.id === "string" ? rule.id : "";

    if (!id || ids.has(id)) {
      const base = `${pageType}-${index}`;
      let n = 2;
      id = base;

      while (ids.has(id)) {
        id = `${base}-${n}`;
        n++;
      }
    }

    ids.add(id);
    return { ...rule, id };
  });
}

function isRuleLike(value: unknown): value is Omit<ITemplateRule, "id"> & { id?: unknown } {
  return isRecord(value) && typeof value.template === "string" && (value.when === undefined || isRecord(value.when));
}
