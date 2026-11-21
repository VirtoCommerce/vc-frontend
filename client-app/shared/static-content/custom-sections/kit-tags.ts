import { defineAsyncComponent, h } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import { VcBadge, VcButton, VcIcon } from "@/ui-kit/components";
import { MAIN_COLORS } from "@/ui-kit/constants";
import { toSectionLink } from "./urls";
import type { VNode } from "vue";

/** The attributes each kit tag takes; any other is left out. */
export const KIT_TAG_ATTRIBUTES = {
  "vc-button": ["label", "to", "color", "variant", "size", "prepend-icon", "append-icon", "full-width"],
  "vc-icon": ["name", "size", "color"],
  "vc-badge": ["label", "color", "variant", "size"],
  "vc-products": ["query", "filter", "take", "view", "columns"],
} as const satisfies Record<string, readonly string[]>;

export type KitTagType = keyof typeof KIT_TAG_ATTRIBUTES;

const ProductsBlock = defineAsyncComponent(() => import("../components/products-block.vue"));
const ProductsCarousel = defineAsyncComponent(() => import("../components/products-carousel.vue"));

const BUTTON_VARIANTS = ["solid", "outline", "soft", "surface", "ghost", "tonal"] as const;
const BUTTON_SIZES = ["xxs", "xs", "sm", "md", "lg"] as const;
const BADGE_VARIANTS = ["solid", "soft", "outline", "surface", "ghost", "tonal"] as const;
const BADGE_SIZES = ["xs", "sm", "md", "lg"] as const;
const ICON_SIZES = ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"] as const;
const PALETTE_VARIABLE_REGEX = /^--color-[a-z0-9-]+$/;

const MAX_PRODUCTS = 24;
const DEFAULT_PRODUCTS = 4;
const MAX_COLUMNS = 6;
const DEFAULT_COLUMNS = 4;
const MAX_TABLET_COLUMNS = 3;

export function isKitTag(tag: string): tag is KitTagType {
  return Object.hasOwn(KIT_TAG_ATTRIBUTES, tag);
}

export function isKitTagAttribute(tag: string, name: string): boolean {
  return isKitTag(tag) && (KIT_TAG_ATTRIBUTES[tag] as readonly string[]).includes(name);
}

/** `attributes` hold the tag's attributes with their bindings resolved; a value the component does not take is left out. */
export function renderKitTag(
  tag: KitTagType,
  attributes: Record<string, string>,
  props: Record<string, unknown>,
): VNode {
  switch (tag) {
    case "vc-button":
      return h(
        VcButton,
        {
          ...props,
          ...getLinkAttr(attributes.to ? toSectionLink(attributes.to) : undefined),
          color: oneOf(MAIN_COLORS, attributes.color),
          variant: oneOf(BUTTON_VARIANTS, attributes.variant),
          size: oneOf(BUTTON_SIZES, attributes.size),
          prependIcon: attributes["prepend-icon"] || undefined,
          appendIcon: attributes["append-icon"] || undefined,
          fullWidth: isOn(attributes["full-width"]),
        },
        () => attributes.label,
      );
    case "vc-icon":
      return h(VcIcon, {
        ...props,
        name: attributes.name || undefined,
        size: oneOf(ICON_SIZES, attributes.size) ?? toInteger(attributes.size, 1, Number.MAX_SAFE_INTEGER),
        color: oneOf(MAIN_COLORS, attributes.color) ?? toPaletteVariable(attributes.color),
      });
    case "vc-badge":
      return h(
        VcBadge,
        {
          ...props,
          color: oneOf(MAIN_COLORS, attributes.color),
          variant: oneOf(BADGE_VARIANTS, attributes.variant),
          size: oneOf(BADGE_SIZES, attributes.size),
        },
        () => attributes.label,
      );
    case "vc-products":
      return renderProducts(attributes, props);
  }
}

function renderProducts(attributes: Record<string, string>, props: Record<string, unknown>): VNode {
  const count = toInteger(attributes.take, 1, MAX_PRODUCTS) ?? DEFAULT_PRODUCTS;
  const columns = toInteger(attributes.columns, 1, MAX_COLUMNS) ?? DEFAULT_COLUMNS;
  const query = { query: attributes.query || undefined, filter: attributes.filter || undefined, count };

  return attributes.view === "carousel"
    ? h(ProductsCarousel, { ...props, ...query, slidesPerView: columns })
    : h(ProductsBlock, {
        ...props,
        ...query,
        columnsAmountDesktop: String(columns),
        columnsAmountTablet: String(Math.min(columns, MAX_TABLET_COLUMNS)),
      });
}

function oneOf<T extends string>(values: readonly T[], value: string | undefined): T | undefined {
  return values.find((candidate) => candidate === value);
}

/** A boolean attribute: present and not `false`. */
function isOn(value: string | undefined): boolean {
  return value !== undefined && value !== "false";
}

function toInteger(value: string | undefined, min: number, max: number): number | undefined {
  const number = value?.trim() ? Number(value) : Number.NaN;
  return Number.isInteger(number) && number >= min && number <= max ? number : undefined;
}

function toPaletteVariable(value: string | undefined): string | undefined {
  return value && PALETTE_VARIABLE_REGEX.test(value) ? value : undefined;
}
