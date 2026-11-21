import { defineAsyncComponent, markRaw } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import { VcBadge, VcButton, VcIcon } from "@/ui-kit/components";
import { MAIN_COLORS } from "@/ui-kit/constants";
import { PRODUCT_VIEWS } from "./constants";
import { registerBuiltInKitEntries } from "./registry";
import type { BuiltInBehaviorNameType, BuiltInTagNameType } from "./registry";
import type { CustomSectionValueType, ICustomSectionBehavior, ICustomSectionField, ICustomSectionTag } from "../types";

const COLOR: ICustomSectionField = { type: "select", options: [...MAIN_COLORS], description: "A palette color." };
const ICON: ICustomSectionField = {
  type: "select",
  optionsFrom: "icons",
  description: "An icon of the storefront's set.",
};
const BUTTON_VARIANTS = [
  "solid",
  "outline",
  "soft",
  "surface",
  "ghost",
  "tonal",
] as const satisfies readonly VcButtonVariantType[];
const BADGE_VARIANTS = [
  "solid",
  "outline",
  "soft",
  "surface",
  "ghost",
  "tonal",
] as const satisfies readonly VcBadgeVariantType[];
const BUTTON_SIZES = ["xxs", "xs", "sm", "md", "lg"] as const satisfies readonly VcButtonSizeType[];
const BADGE_SIZES = ["xs", "sm", "md", "lg"] as const satisfies readonly VcBadgeSizeType[];
const ICON_SIZES: ReadonlySet<string> = new Set([
  "xxs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "xxl",
] satisfies VcIconSizeType[]);
const PALETTE_VARIABLE_REGEX = /^--color-[a-z0-9-]+$/;
const PIXELS_REGEX = /^\d+$/;

const BUILT_IN_TAGS: Record<BuiltInTagNameType, ICustomSectionTag> = {
  "vc-button": {
    component: markRaw(VcButton),
    description: "A button; with `to`, a link that looks like one.",
    attributes: {
      label: { type: "string" },
      to: { type: "link" },
      color: COLOR,
      variant: { type: "select", options: [...BUTTON_VARIANTS] },
      size: { type: "select", options: [...BUTTON_SIZES] },
      "prepend-icon": ICON,
      "append-icon": ICON,
      "full-width": { type: "boolean" },
    },
    slotAttribute: "label",
    mapProps: (attributes) => ({
      ...getLinkAttr(toText(attributes.to)),
      color: attributes.color,
      variant: attributes.variant,
      size: attributes.size,
      prependIcon: attributes["prepend-icon"],
      appendIcon: attributes["append-icon"],
      fullWidth: attributes["full-width"] === true,
    }),
  },
  "vc-icon": {
    component: markRaw(VcIcon),
    description: "An icon of the storefront's icon set.",
    attributes: {
      name: ICON,
      size: { type: "string", description: "xxs, xs, sm, md, lg, xl, xxl, or a size in pixels." },
      color: { type: "string", description: "A palette color, or a palette variable such as --color-primary-700." },
    },
    mapProps: ({ name, size, color }) => ({
      name,
      size: toIconSize(toText(size)),
      color: toIconColor(toText(color)),
    }),
  },
  "vc-badge": {
    component: markRaw(VcBadge),
    description: "A badge with a short label.",
    attributes: {
      label: { type: "string" },
      color: COLOR,
      variant: { type: "select", options: [...BADGE_VARIANTS] },
      size: { type: "select", options: [...BADGE_SIZES] },
    },
    slotAttribute: "label",
  },
  "vc-products": {
    component: markRaw(defineAsyncComponent(() => import("../components/sb-products.vue"))),
    description:
      "Products of a search or a filter as a grid or a carousel, bare: it fills the element it stands in, and the " +
      "grid fits as many columns as that element's width allows, columns at most.",
    attributes: {
      query: { type: "string", description: "A search phrase." },
      filter: { type: "string", description: "A catalog filter expression." },
      take: { type: "number", min: 1, max: 24, description: "How many products, 4 by default." },
      view: { type: "select", options: [...PRODUCT_VIEWS] },
      columns: { type: "number", min: 1, max: 6, description: "The most products in a row, 4 by default." },
    },
  },
};

const BUILT_IN_BEHAVIORS: Record<BuiltInBehaviorNameType, ICustomSectionBehavior> = {
  inview: {
    directive: async () => (await import("../behaviors/inview")).vInview,
    description: "Sets data-visible while the element is on screen.",
    options: {
      threshold: { type: "number", min: 0, max: 1, description: "The share of the element on screen, 0.2 by default." },
      once: { type: "boolean", description: "data-visible stays once set." },
    },
    writes: ["data-visible"],
  },
  "scroll-progress": {
    directive: async () => (await import("../behaviors/scroll-progress")).vScrollProgress,
    description: "--scroll-progress goes from 0, as the element enters the viewport, to 1, as it leaves.",
    writes: ["--scroll-progress"],
  },
  pointer: {
    directive: async () => (await import("../behaviors/pointer")).vPointer,
    description:
      "Where the pointer is inside the element, 0 to 1 each way; --pointer-inline is 0 at the inline start, " +
      "so it flips in right-to-left text. Off on touch screens.",
    writes: ["--pointer-x", "--pointer-y", "--pointer-inline", "--pointer-active"],
  },
  "count-up": {
    directive: async () => (await import("../behaviors/count-up")).vCountUp,
    description:
      "The text counts up to the number, in the page's language, when the element first shows; " +
      "screen readers get the number at once.",
    value: { type: "number" },
    options: {
      duration: { type: "number", min: 0, max: 5000, description: "In milliseconds." },
      decimals: { type: "number", min: 0, max: 4 },
    },
    writes: ["text"],
    textAttributes: ["data-count-up"],
  },
  countdown: {
    directive: async () => (await import("../behaviors/countdown")).vCountdown,
    description:
      "Children with data-countdown-part show the time left until the date; data-ended is set when it passes.",
    value: { type: "date" },
    options: {
      part: {
        type: "select",
        options: ["days", "hours", "minutes", "seconds"],
        description: "On a child: what it shows.",
      },
    },
    writes: ["data-ended", "text"],
    textAttributes: ["data-countdown-part"],
  },
  copy: {
    directive: async () => (await import("../behaviors/copy")).vCopy,
    description: "A click copies the text, sets data-copied for 2 seconds and shows a notification that it did.",
    value: { type: "string" },
    writes: ["data-copied"],
  },
  marquee: {
    directive: async () => (await import("../behaviors/marquee")).vMarquee,
    description:
      "The children are repeated once for a seamless loop. --marquee-width is the width of one run; animate " +
      "translate from 0 to var(--marquee-shift), which moves toward the inline start and reverses in " +
      "right-to-left text. The loop pauses, with data-paused set, while the pointer is over it or the focus inside.",
    writes: ["--marquee-width", "--marquee-shift", "data-paused"],
    repeatsChildren: true,
  },
};

let isKitRegistered = false;

/** Once, under the names the registry reserves for them. */
export function registerBuiltInKit(): void {
  if (isKitRegistered) {
    return;
  }

  isKitRegistered = true;
  registerBuiltInKitEntries(BUILT_IN_TAGS, BUILT_IN_BEHAVIORS);
}

function toText(value: CustomSectionValueType | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toIconSize(size: string | undefined): string | number | undefined {
  if (size && ICON_SIZES.has(size)) {
    return size;
  }

  return size && PIXELS_REGEX.test(size) ? Number(size) : undefined;
}

function toIconColor(color: string | undefined): string | undefined {
  return color && ((MAIN_COLORS as readonly string[]).includes(color) || PALETTE_VARIABLE_REGEX.test(color))
    ? color
    : undefined;
}
