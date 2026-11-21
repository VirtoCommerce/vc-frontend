import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { isCustomSectionType } from "@/shared/static-content/custom-sections/type-name";
import type { PageBuilderSchemaItemType, PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionType } from "@/core/theme-snapshot";

/** The custom types as section schemas, `custom: true`, each named in the page's language. */
export function toCustomSectionSchemas(
  types: Record<string, ICustomSectionType>,
  localize: (name: ICustomSectionType["name"]) => unknown,
): PageBuilderSchemaItemType {
  // The fields go as declared, wider than the descriptor type the built-in schemas are read with.
  return Object.fromEntries(
    Object.entries(types)
      .filter(([type, definition]) => isCustomSectionType(type) && Array.isArray(definition?.schema?.settings))
      .map(([type, { name, schema }]) => {
        const shownName = localize(name);

        return [
          type,
          {
            type,
            name: typeof shownName === "string" && shownName ? shownName : type,
            settings: schema.settings,
            targetTemplates: schema.targetTemplates,
            limit: schema.limit,
            icon: schema.icon,
            custom: true,
          },
        ];
      }),
  ) as unknown as PageBuilderSchemaItemType;
}

/** Calls `apply` with the schemas and the theme's custom types now, and again whenever those change. */
export function watchCustomSectionSchemas(
  schemas: PageBuilderSchemaType,
  apply: (schemas: PageBuilderSchemaType) => void,
): void {
  const { theme, localizeThemeDraft } = useThemeSnapshot();
  const customSchemas = computed(() => toCustomSectionSchemas(theme.value?.customSections ?? {}, localizeThemeDraft));

  watch(
    () => JSON.stringify(customSchemas.value),
    () => apply({ ...schemas, sections: { ...customSchemas.value, ...schemas.sections } }),
    { immediate: true },
  );
}
