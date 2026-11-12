import { isRecord } from "@/core/utilities";
import {
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME,
  PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES,
} from "@/shared/catalog/constants/product";
import type { ITemplateCondition, ITemplateSubject } from "./conditions";
import type { ITemplateRule, ITemplateRules, IThemePageDocument, ThemePageType } from "@/core/theme-snapshot";

const PAGE_TYPES: readonly ThemePageType[] = ["product", "category", "page"];

const DEFAULT_TEMPLATE_RULES: Readonly<Record<ThemePageType, ITemplateRule[]>> = {
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

export interface ITemplatePick {
  template: string;
  ruleId: string | null;
}

export interface ITemplateResolution {
  pageType: ThemePageType;
  template: string;
  ruleId: string | null;
  document: IThemePageDocument;
  /** What the rules pick for the page, whichever template the designer has open. */
  rules: ITemplatePick;
}

export type TemplateChoiceType = Omit<ITemplateResolution, "rules">;

export interface ITemplateChoiceOptions {
  pageType: ThemePageType;
  subject: ITemplateSubject;
  rules: ITemplateRules | undefined;
  /** Holds the page type's own template: the built-in ones are always among them. */
  templates: Readonly<Record<string, IThemePageDocument>>;
  getCondition: (name: string) => ITemplateCondition | undefined;
  ownTemplate?: unknown;
}

export function getTemplatePageType(key: string): string {
  return key.split(".")[0];
}

export function chooseTemplate(options: ITemplateChoiceOptions): TemplateChoiceType {
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

  return { pageType, template: pageType, ruleId: null, document: templates[pageType] };
}

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

/** Matches the ids the backend's snapshot builder gives, so a reported rule id names the same rule on both sides. */
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
