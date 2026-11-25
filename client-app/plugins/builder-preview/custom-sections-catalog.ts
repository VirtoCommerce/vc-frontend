import { computed, watch } from "vue";
import { isTranslatableDictionary, useThemeSnapshot } from "@/core/theme-snapshot";
import { isRecord } from "@/core/utilities";
import { registerBuiltInKit } from "@/shared/static-content/custom-sections/kit";
import { getKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";
import { isCustomSectionType } from "@/shared/static-content/custom-sections/type-name";
import type { PageBuilderDescriptorType } from "./models/PageBuilderComponentType";
import type { PageBuilderSchemaItemType, PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionDefinition, IThemeSchemaField } from "@/core/theme-snapshot";
import type { ICustomSectionKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";

/**
 * The keys and types of a custom type's field, as the server takes them. A type file written past its checks could
 * hold others, such as a search's `request`, which the designer would run with the admin's session.
 */
const FIELD_KEYS = new Set([
  "id",
  "type",
  "label",
  "default",
  "translatable",
  "tab",
  "info",
  "placeholder",
  "required",
  "multiline",
  "multiple",
  "format",
  "options",
  "element",
  "min",
  "max",
  "step",
]);
const FIELD_TYPES = new Set<unknown>([
  "header",
  "paragraph",
  "string",
  "text",
  "number",
  "slider",
  "checkbox",
  "select",
  "color-token",
  "images",
  "calendar",
  "list",
  "object",
]);

/** The custom types as section schemas, `custom: true`, each named as the type stores it: a text, or one per language. */
export function toCustomSectionSchemas(types: Record<string, ICustomSectionDefinition>): PageBuilderSchemaItemType {
  return Object.fromEntries(
    Object.entries(types)
      .filter(([type, definition]) => isCustomSectionType(type) && Array.isArray(definition?.schema?.settings))
      .map(([type, { name, schema }]): [string, PageBuilderDescriptorType] => {
        return [
          type,
          {
            type,
            name: isTypeName(name) ? name : type,
            settings: toFields(schema.settings),
            targetTemplates: schema.targetTemplates,
            limit: schema.limit,
            icon: schema.icon,
            custom: true,
            // The storefront applies the shared anchor to every section, but no background to a custom one.
            excludeShared: ["background"],
          },
        ];
      }),
  );
}

/** Calls `apply` now and whenever the theme's custom types or the registered kit change. */
export function watchCustomSectionCatalog(
  schemas: PageBuilderSchemaType,
  apply: (schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void,
): void {
  const { theme } = useThemeSnapshot();

  registerBuiltInKit();

  const customSchemas = computed(() => toCustomSectionSchemas(theme.value?.customSections ?? {}));
  const kit = computed(() => getKitCatalog());

  watch(
    () => JSON.stringify([customSchemas.value, kit.value]),
    () => apply({ ...schemas, sections: { ...customSchemas.value, ...schemas.sections } }, kit.value),
    { immediate: true },
  );
}

/** The fields of the types the server takes, with only the keys it takes, a row's or an object's too. */
function toFields(fields: unknown[]): IThemeSchemaField[] {
  return fields.filter(isRecord).flatMap((field) =>
    FIELD_TYPES.has(field.type)
      ? [
          Object.fromEntries(
            Object.entries(field)
              .filter(([key]) => FIELD_KEYS.has(key))
              .map(([key, value]) => [key, key === "element" && Array.isArray(value) ? toFields(value) : value]),
          ),
        ]
      : [],
  );
}

/** As the server reads a type's name: a text, or a text per language, none of them blank. */
function isTypeName(name: unknown): name is ICustomSectionDefinition["name"] {
  return typeof name === "string"
    ? name.trim() !== ""
    : isTranslatableDictionary(name) && Object.values(name).every((text) => text.trim() !== "");
}
