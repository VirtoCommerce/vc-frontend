import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { registerBuiltInKit } from "@/shared/static-content/custom-sections/kit";
import { getKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";
import { isCustomSectionType } from "@/shared/static-content/custom-sections/type-name";
import type { PageBuilderSchemaItemType, PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionType } from "@/core/theme-snapshot";
import type { ICustomSectionKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";

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

/**
 * Calls `apply` with the schemas, the theme's custom types among the sections, and the kit their templates use, now
 * and again whenever the custom types or the registered kit change.
 */
export function watchCustomSectionCatalog(
  schemas: PageBuilderSchemaType,
  apply: (schemas: PageBuilderSchemaType, kit: ICustomSectionKitCatalog) => void,
): void {
  const { theme, localizeThemeDraft } = useThemeSnapshot();

  registerBuiltInKit();

  const customSchemas = computed(() => toCustomSectionSchemas(theme.value?.customSections ?? {}, localizeThemeDraft));
  const kit = computed(() => getKitCatalog());

  watch(
    () => JSON.stringify([customSchemas.value, kit.value]),
    () => apply({ ...schemas, sections: { ...customSchemas.value, ...schemas.sections } }, kit.value),
    { immediate: true },
  );
}
