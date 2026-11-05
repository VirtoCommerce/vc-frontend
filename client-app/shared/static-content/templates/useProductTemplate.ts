import { computed, toValue } from "vue";
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES } from "@/shared/catalog/constants/product";
import { MAIN_SECTION_TYPES } from "./built-in";
import { splitTemplate } from "./split";
import { useTemplateResolution } from "./useThemeTemplates";
import type { ITemplateSubject } from "./conditions";
import type { Product } from "@/core/api/graphql/types";
import type { IPageContent } from "@/shared/static-content/types";
import type { MaybeRefOrGetter } from "vue";

/** Sections shown in the product's main column, beside the price, rather than across the page. */
export const PRODUCT_COLUMN_SECTION_TYPES: ReadonlySet<string> = new Set(["product-description", "product-reviews"]);

const B2C_VARIATIONS_LAYOUT = "b2c";

/**
 * The product page's template: chosen by the store's rules for the product with all its outlines, so it does not
 * depend on where the visitor came from, and split around the product info.
 */
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

  /** How variations load is the template's: the product's property chooses the template, never this directly. */
  const isB2cLayout = computed(() => productInfoSection.value?.variationsLayout === B2C_VARIATIONS_LAYOUT);

  /** The variations layout the price block shows: the template's, as the variations load by it. */
  const variationsLayout = computed(() =>
    isB2cLayout.value ? PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2c : PRODUCT_VARIATIONS_LAYOUT_PROPERTY_VALUES.b2b,
  );

  return { resolution, template, parts, productInfoSection, isB2cLayout, variationsLayout };
}
