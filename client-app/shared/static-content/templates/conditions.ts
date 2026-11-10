import { createGlobalState } from "@vueuse/core";
import { escapeRegExp, trim } from "lodash-es";
import { shallowReactive } from "vue";
import { isRecord } from "@/core/utilities";
import { CONTENT_FILE_OBJECT_TYPE, PAGES_OBJECT_TYPE } from "@/shared/layout/composables/usePageLayout";
import type { ThemePageType } from "@/core/theme-snapshot";

export interface ITemplateSubject {
  /** A product's every outline or a category's own, as category ids. */
  categoryPaths?: string[][];
  categoryId?: string;
  productType?: string;
  properties?: { name?: string; value?: unknown }[];
  permalink?: string;
  language?: string;
  settings?: Record<string, unknown>;
  /** The slug's `objectType`: `Pages` from the database, `ContentFile` for a file page. */
  objectType?: string;
}

export interface ITemplateCondition {
  /** The key in a rule's `when`; a plugin prefixes its own (`loyalty.tier`). */
  name: string;
  pageTypes: ThemePageType[];
  label?: string;
  /** A schema field: the designer builds the condition's form from it. */
  value: Record<string, unknown>;
  evaluate(subject: ITemplateSubject, value: unknown): boolean;
}

export type TemplateConditionDescriptorType = Omit<ITemplateCondition, "evaluate">;

const BUILT_IN_CONDITIONS: ITemplateCondition[] = [
  {
    name: "inCategory",
    pageTypes: ["product", "category"],
    label: "In category",
    // A list of strings; a legacy comma-separated string still evaluates.
    value: { type: "list", label: "Category ids" },
    evaluate: (subject, value) => {
      const ids = toList(value);
      const segments = new Set([subject.categoryId, ...(subject.categoryPaths ?? []).flat()]);
      return ids.some((id) => segments.has(id));
    },
  },
  {
    name: "productType",
    pageTypes: ["product"],
    label: "Product type",
    value: { type: "string" },
    evaluate: (subject, value) => typeof value === "string" && subject.productType === value,
  },
  {
    name: "property",
    pageTypes: ["product"],
    label: "Property",
    value: {
      type: "object",
      element: [
        { id: "name", type: "string", label: "Name" },
        { id: "equals", type: "string", label: "Value" },
      ],
    },
    evaluate: (subject, value) => {
      const condition = toNamedValue(value);
      return (
        !!condition &&
        (subject.properties ?? []).some(
          (property) => property.name === condition.name && property.value === condition.equals,
        )
      );
    },
  },
  {
    name: "path",
    pageTypes: ["page"],
    label: "Path",
    value: { type: "string", label: "Path, * matches any characters" },
    evaluate: (subject, value) => typeof value === "string" && matchesPath(subject.permalink, value),
  },
  {
    name: "language",
    pageTypes: ["page"],
    label: "Language",
    value: { type: "string" },
    evaluate: (subject, value) =>
      typeof value === "string" &&
      !!subject.language &&
      (subject.language === value || subject.language.split("-")[0] === value),
  },
  {
    name: "source",
    pageTypes: ["page"],
    label: "Source",
    value: {
      type: "select",
      options: [
        { label: "Page", value: PAGES_OBJECT_TYPE },
        { label: "File page", value: CONTENT_FILE_OBJECT_TYPE },
      ],
    },
    evaluate: (subject, value) => typeof value === "string" && subject.objectType === value,
  },
  {
    name: "setting",
    pageTypes: ["page"],
    label: "Page setting",
    value: {
      type: "object",
      element: [
        { id: "name", type: "string", label: "Name" },
        { id: "equals", type: "string", label: "Value" },
      ],
    },
    evaluate: (subject, value) => {
      const condition = toNamedValue(value);
      return !!condition && subject.settings?.[condition.name] === condition.equals;
    },
  },
];

/** Values compare exactly (except `path`): a `VirtoFrontend_UI_Layout` of `b2c` does not match the default B2C rule. */
export const useTemplateConditions = createGlobalState(() => {
  const conditions = shallowReactive(new Map(BUILT_IN_CONDITIONS.map((condition) => [condition.name, condition])));

  function registerTemplateCondition(condition: ITemplateCondition): void {
    conditions.set(condition.name, condition);
  }

  function getTemplateCondition(name: string): ITemplateCondition | undefined {
    return conditions.get(name);
  }

  function getTemplateConditionDescriptors(): TemplateConditionDescriptorType[] {
    return [...conditions.values()].map(({ name, pageTypes, label, value }) => ({ name, pageTypes, label, value }));
  }

  return { registerTemplateCondition, getTemplateCondition, getTemplateConditionDescriptors };
});

export function matchesPath(permalink: string | undefined, glob: string): boolean {
  if (permalink === undefined) {
    return false;
  }

  const pattern = trimSlashes(glob).split("*").map(escapeRegExp).join(".*");

  return new RegExp(`^${pattern}$`, "i").test(trimSlashes(permalink));
}

function trimSlashes(value: string): string {
  return trim(value.trim(), "/");
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" ? value.split(",").map((item) => item.trim()) : [];
}

function toNamedValue(value: unknown): { name: string; equals: unknown } | undefined {
  return isRecord(value) && typeof value.name === "string" ? { name: value.name, equals: value.equals } : undefined;
}
