import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { registerBuiltInKit } from "@/shared/static-content/custom-sections/kit";
import { getKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";
import { isCustomSectionType } from "@/shared/static-content/custom-sections/type-name";
import type { PageBuilderDescriptorType } from "./models/PageBuilderComponentType";
import type { PageBuilderSchemaItemType, PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { ICustomSectionDefinition } from "@/core/theme-snapshot";
import type { ICustomSectionKitCatalog } from "@/shared/static-content/custom-sections/kit/catalog";

/** The custom types as section schemas, `custom: true`, each named in the page's language. */
export function toCustomSectionSchemas(
  types: Record<string, ICustomSectionDefinition>,
  localize: (name: ICustomSectionDefinition["name"]) => unknown,
): PageBuilderSchemaItemType {
  return Object.fromEntries(
    Object.entries(types)
      .filter(([type, definition]) => isCustomSectionType(type) && Array.isArray(definition?.schema?.settings))
      .map(([type, { name, schema }]): [string, PageBuilderDescriptorType] => {
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
  );
}

/** Calls `apply` now and whenever the theme's custom types or the registered kit change. */
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
