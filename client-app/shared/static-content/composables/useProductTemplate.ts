import { computed, toValue } from "vue";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES } from "@/shared/catalog/constants/product";
import { MAIN_SECTION_TYPES } from "../templates/built-in";
import { splitTemplate } from "../templates/split";
import { useTemplateResolution } from "./useThemeTemplates";
import type { ITemplateSubject } from "../templates/conditions";
import type { IPageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

const PRODUCT_COLUMN_SECTION_TYPES: ReadonlySet<string> = new Set(["product-description", "product-reviews"]);

const B2C_VARIATIONS_LAYOUT = "b2c";

/** Rules get all the product's outlines, so the template does not depend on where the visitor came from. */
export function useProductTemplate(product: MaybeRefOrGetter<Product | undefined>) {
  const subject = computed<ITemplateSubject | undefined>(() => {
    const value = toValue(product);

    return value
      ? {
          categoryPaths: value.outlines.map((outline) => outline.items?.map((item) => item.id) ?? []),
          productType: value.productType ?? undefined,
          properties: value.properties.map((property) => ({ name: property.name, value: property.value })),
        }
      : undefined;
  });

  const resolution = useTemplateResolution("product", subject);

  const template = computed(() => resolution.value?.document);

  const parts = computed(() =>
    splitTemplate(template.value?.content ?? [], MAIN_SECTION_TYPES.product, PRODUCT_COLUMN_SECTION_TYPES),
  );

  const productInfoSection = computed(() => parts.value.main as IPageContent | undefined);

  /** Only the template decides how variations load; the product's property matters only through the template choice. */
  const isB2cLayout = computed(() => productInfoSection.value?.variationsLayout === B2C_VARIATIONS_LAYOUT);

  const variationsLayout = computed(() =>
    isB2cLayout.value ? PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c : PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2b,
  );

  return { resolution, template, parts, productInfoSection, isB2cLayout, variationsLayout };
}
