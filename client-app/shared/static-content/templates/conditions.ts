import { createGlobalState } from "@vueuse/core";
import { shallowReactive } from "vue";
import type { ThemePageType } from "@/core/theme-snapshot";

/** What the template rules are checked against: data the storefront already has for the page. */
export interface ITemplateSubject {
  /** Product: every outline of the product, as category ids. Category: its own outline. */
  categoryPaths?: string[][];
  /** Category: the category itself. */
  categoryId?: string;
  productType?: string;
  properties?: { name?: string; value?: unknown }[];
  /** Content page: its permalink. */
  permalink?: string;
  /** Content page: its language. */
  language?: string;
  /** Content page: its own settings. */
  settings?: Record<string, unknown>;
  /** Content page: the slug's `objectType` (`Pages`, `ContentFile`). */
  objectType?: string;
}

export interface ITemplateCondition {
  /** As in the rules; a plugin uses its own prefix (`loyalty.tier`). */
  name: string;
  pageTypes: ThemePageType[];
  label?: string;
  /** The condition's value as a schema field: the designer builds the condition's form from it. */
  value: Record<string, unknown>;
  evaluate(subject: ITemplateSubject, value: unknown): boolean;
}

/** The descriptor the preview handshake announces: a condition without its code. */
export type TemplateConditionDescriptorType = Omit<ITemplateCondition, "evaluate">;

const BUILT_IN_CONDITIONS: ITemplateCondition[] = [
  {
    name: "inCategory",
    pageTypes: ["product", "category"],
    label: "In category",
    value: { type: "string", label: "Category ids, comma-separated" },
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
      settings: [
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
        { label: "Page", value: "Pages" },
        { label: "File page", value: "ContentFile" },
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
      settings: [
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

/**
 * The conditions template rules can use. Values compare exactly, case and spaces included (except `path`), so a
 * product whose `VirtoFrontend_UI_Layout` is `b2c` does not match the default B2C rule, as in production.
 */
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

/** A permalink glob: `*` matches any characters; case and the leading and trailing `/` are ignored. */
export function matchesPath(permalink: string | undefined, glob: string): boolean {
  if (permalink === undefined) {
    return false;
  }

  const pattern = trimSlashes(glob)
    .split("*")
    .map((part) => part.replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`))
    .join(".*");

  return new RegExp(`^${pattern}$`, "i").test(trimSlashes(permalink));
}

function trimSlashes(value: string): string {
  const text = value.trim();
  let start = 0;
  let end = text.length;

  while (start < end && text[start] === "/") {
    start++;
  }

  while (end > start && text[end - 1] === "/") {
    end--;
  }

  return text.slice(start, end);
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" ? value.split(",").map((item) => item.trim()) : [];
}

function toNamedValue(value: unknown): { name: string; equals: unknown } | undefined {
  return typeof value === "object" && value !== null && typeof (value as { name?: unknown }).name === "string"
    ? (value as { name: string; equals: unknown })
    : undefined;
}
