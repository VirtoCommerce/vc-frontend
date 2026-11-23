import { defineAsyncComponent, markRaw } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import {
  VcAlert,
  VcBadge,
  VcButton,
  VcChip,
  VcIcon,
  VcImage,
  VcLink,
  VcProperty,
  VcRating,
  VcShape,
  VcTypography,
} from "@/ui-kit/components";
import { MAIN_COLORS, MAX_RATING } from "@/ui-kit/constants";
import { COPIED_DURATION, DEFAULT_COUNT_UP_DURATION, DEFAULT_INVIEW_THRESHOLD } from "../behaviors/constants";
import {
  DEFAULT_PRODUCT_COLUMNS,
  DEFAULT_PRODUCT_VIEW,
  DEFAULT_PRODUCTS,
  MAX_PRODUCTS,
  PRODUCT_CARD_ELEMENTS,
  PRODUCT_VIEWS,
} from "./constants";
import { registerBuiltInKitEntries } from "./registry";
import type { BuiltInBehaviorNameType, BuiltInTagNameType } from "./registry";
import type { CustomSectionValueType, ICustomSectionBehavior, ICustomSectionField, ICustomSectionTag } from "../types";

const COLOR: ICustomSectionField = { type: "select", options: [...MAIN_COLORS], description: "A palette color." };
const PALETTE_COLOR: ICustomSectionField = {
  type: "string",
  description: "A palette color, or a palette variable such as --color-primary-700.",
};
const ICON: ICustomSectionField = {
  type: "select",
  optionsFrom: "icons",
  description: "An icon of the storefront's set.",
};
/** A button's, a badge's and a chip's variants are the same list. */
const VARIANTS = ["solid", "outline", "soft", "surface", "ghost", "tonal"] as const satisfies readonly (
  VcButtonVariantType | VcBadgeVariantType | VcChipVariantType
)[];
const BUTTON_SIZES = ["xxs", "xs", "sm", "md", "lg"] as const satisfies readonly VcButtonSizeType[];
const BADGE_SIZES = ["xs", "sm", "md", "lg"] as const satisfies readonly VcBadgeSizeType[];
const CHIP_SIZES = ["sm", "md", "lg"] as const satisfies readonly VcChipSizeType[];
const ALERT_COLORS = ["info", "success", "warning", "danger"] as const satisfies readonly VcAlertColorType[];
const ALERT_VARIANTS = ["solid", "soft", "outline", "tonal"] as const satisfies readonly VcAlertVariantType[];
const ALERT_SIZES = ["sm", "md"] as const satisfies readonly VcAlertSizeType[];
const RATING_MODES = ["mini", "full"] as const;
const RATING_SIZES = ["xs", "sm", "md"] as const;
/** No `h1`: the page holds it. */
const TYPOGRAPHY_TAGS = ["p", "span", "div", "h2", "h3", "h4", "h5", "h6"] as const;
const TYPOGRAPHY_VARIANTS = [
  "base",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const satisfies readonly VcTypographyVariantType[];
const ICON_SIZES: ReadonlySet<string> = new Set(["xxs", "xs", "sm", "md", "lg", "xl", "xxl"]);
const MAX_IMAGE_SIDE = 10_000;
const MIN_SHAPE_SIZE = 8;
const MAX_SHAPE_SIZE = 512;
/** Its span and the largest icon of the set. */
const ICON_COST = 1 + __SB_ICON_ELEMENTS__;
/** Its root, its content, prepend, label and append spans, and two icons. */
const BUTTON_COST = 5 + 2 * ICON_COST;
/** Its span and its content's. */
const BADGE_COST = 2;
/** Its span, its content and its icon. */
const CHIP_COST = 2 + ICON_COST;
/** Its root, its icon's box and icon, its content and its title. */
const ALERT_COST = 4 + ICON_COST;
/** Its root, label, stars' box and value with its two spans, and per star a button, two spans and two icons. */
const RATING_COST = 6 + MAX_RATING * (3 + 2 * ICON_COST);
/** Its box and its icon. */
const SHAPE_COST = 1 + ICON_COST;
/** Its root, label, dots and value. */
const PROPERTY_COST = 4;
const PALETTE_VARIABLE_REGEX = /^--color-[a-z0-9-]+$/;
const PIXELS_REGEX = /^\d+$/;

const BUILT_IN_TAGS: Record<BuiltInTagNameType, ICustomSectionTag> = {
  "vc-button": {
    component: markRaw(VcButton),
    description:
      "A button; with `to`, a link that looks like one. A call to action needs `to`: without `to` it does nothing. " +
      "An element around it sets its corners, least width, icon size and letter case through --vc-button-radius, " +
      "--vc-button-min-width, --vc-button-icon-size and --vc-button-text-transform.",
    attributes: {
      label: { type: "string" },
      to: { type: "link" },
      color: COLOR,
      variant: { type: "select", options: [...VARIANTS] },
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
    cost: BUTTON_COST,
  },
  "vc-icon": {
    component: markRaw(VcIcon),
    description: "An icon of the storefront's icon set.",
    attributes: {
      name: ICON,
      size: { type: "string", description: "xxs, xs, sm, md, lg, xl, xxl, or a whole number of pixels, such as 24." },
      color: PALETTE_COLOR,
    },
    mapProps: ({ name, size, color }) => ({
      // VcIcon draws a default icon for no name; an unset one draws none, as an unknown one.
      name: toText(name) ?? "",
      size: toIconSize(toText(size)),
      color: toPaletteColor(toText(color)),
    }),
    cost: ICON_COST,
  },
  "vc-badge": {
    component: markRaw(VcBadge),
    description: "A badge with a short label.",
    attributes: {
      label: { type: "string" },
      color: COLOR,
      variant: { type: "select", options: [...VARIANTS] },
      size: { type: "select", options: [...BADGE_SIZES] },
    },
    slotAttribute: "label",
    cost: BADGE_COST,
  },
  "vc-products": {
    component: markRaw(defineAsyncComponent(() => import("../components/sb-products.vue"))),
    description:
      "Products of a search or a filter as a grid or a carousel, bare: it fills the element it stands in, and the " +
      "grid fits as many columns as that element's width allows, columns at most.",
    attributes: {
      query: { type: "string", description: "A search phrase." },
      filter: { type: "string", description: "A catalog filter expression." },
      take: {
        type: "number",
        min: 1,
        max: MAX_PRODUCTS,
        description: `How many products, ${DEFAULT_PRODUCTS} by default.`,
      },
      view: { type: "select", options: [...PRODUCT_VIEWS], description: `${DEFAULT_PRODUCT_VIEW} by default.` },
      columns: {
        type: "number",
        min: 1,
        max: 6,
        description: `The most products in a row, ${DEFAULT_PRODUCT_COLUMNS} by default.`,
      },
    },
    cost: 1 + MAX_PRODUCTS * PRODUCT_CARD_ELEMENTS,
    hasSideEffects: true,
  },
  "vc-image": {
    component: markRaw(VcImage),
    description:
      "An image of the asset library. With no image it shows the storefront's no-image picture, so put it under " +
      "data-if when its setting may be unset. --vc-image-object-fit, set on its parent, fits it to its box.",
    attributes: {
      src: { type: "string", description: "A URL of the asset library, or one binding of an images setting." },
      alt: { type: "string", description: 'What the image says; "" (the default) for one that only decorates.' },
      width: { type: "number", min: 1, max: MAX_IMAGE_SIDE, description: "In pixels, so nothing shifts as it loads." },
      height: { type: "number", min: 1, max: MAX_IMAGE_SIDE, description: "In pixels." },
      lazy: { type: "boolean", description: "Loads as it nears the screen: for an image below the fold." },
    },
    mapProps: ({ src, alt, width, height, lazy }) => ({
      src: toText(src),
      alt: toText(alt) ?? "",
      width,
      height,
      lazy: lazy === true,
    }),
  },
  "vc-link": {
    component: markRaw(VcLink),
    description:
      "A text link; a path on the site opens without reloading the page. It has no style of its own: style it " +
      "from the section's CSS through its parent, such as .custom-x__more a.",
    attributes: {
      label: { type: "string" },
      to: { type: "link" },
    },
    slotAttribute: "label",
    // Without `to`, its text alone: a router link needs a target.
    mapProps: ({ to }) => (typeof to === "string" ? { to } : { disabled: true }),
  },
  "vc-chip": {
    component: markRaw(VcChip),
    description: "A chip with a short label and an icon; with `to`, a link.",
    attributes: {
      label: { type: "string" },
      to: { type: "link" },
      icon: ICON,
      color: COLOR,
      variant: { type: "select", options: [...VARIANTS] },
      size: { type: "select", options: [...CHIP_SIZES] },
      rounded: { type: "boolean" },
    },
    slotAttribute: "label",
    mapProps: ({ to, icon, color, variant, size, rounded }) => ({
      ...(typeof to === "string" ? { clickable: true, ...getLinkAttr(to) } : {}),
      icon,
      color,
      variant,
      size,
      rounded: rounded === true,
    }),
    cost: CHIP_COST,
  },
  "vc-alert": {
    component: markRaw(VcAlert),
    description: "A notice with a title and a text, in a status color.",
    attributes: {
      text: { type: "string" },
      title: { type: "string" },
      color: { type: "select", options: [...ALERT_COLORS] },
      variant: { type: "select", options: [...ALERT_VARIANTS] },
      size: { type: "select", options: [...ALERT_SIZES] },
      icon: ICON,
      "with-icon": { type: "boolean", description: "Shows the color's own icon where icon names none." },
      shadow: { type: "boolean" },
    },
    slotAttribute: "text",
    mapProps: (attributes) => ({
      title: attributes.title,
      color: attributes.color,
      variant: attributes.variant,
      size: attributes.size,
      icon: toText(attributes.icon) ?? attributes["with-icon"] === true,
      shadow: attributes.shadow === true,
    }),
    cost: ALERT_COST,
  },
  "vc-typography": {
    component: markRaw(VcTypography),
    description:
      "A text in the storefront's type styles. A heading's style follows its tag unless variant sets another; " +
      "keep its heading level in order with the template's own headings.",
    attributes: {
      text: { type: "string" },
      tag: { type: "select", options: [...TYPOGRAPHY_TAGS], description: "p by default." },
      variant: { type: "select", options: [...TYPOGRAPHY_VARIANTS] },
      color: PALETTE_COLOR,
      truncate: { type: "boolean", description: "One line, cut with an ellipsis." },
    },
    slotAttribute: "text",
    mapProps: ({ tag, variant, color, truncate }) => ({
      tag,
      variant,
      color: toPaletteColor(toText(color)),
      truncate: truncate === true,
    }),
  },
  "vc-rating": {
    component: markRaw(VcRating),
    description: `A rating out of ${MAX_RATING} in stars, read only.`,
    attributes: {
      value: { type: "number", min: 0, max: MAX_RATING },
      mode: {
        type: "select",
        options: [...RATING_MODES],
        description: "mini (the default) shows one star and the value; full shows every star.",
      },
      size: { type: "select", options: [...RATING_SIZES] },
      "with-text": {
        type: "boolean",
        description: `The value out of ${MAX_RATING} and the review count as text; on unless written "false".`,
      },
      "review-count": { type: "number", min: 0 },
      label: { type: "string", description: "Shown before the stars, followed by a colon." },
    },
    mapProps: (attributes) => ({
      readOnly: true,
      value: attributes.value,
      mode: attributes.mode,
      size: attributes.size,
      withText: attributes["with-text"],
      reviewCount: attributes["review-count"],
      label: attributes.label,
    }),
    cost: RATING_COST,
  },
  "vc-shape": {
    component: markRaw(VcShape),
    description:
      "An icon on a color, cut to a polygon, or to the outline of the icon mask names. The icon takes half the " +
      "shape.",
    attributes: {
      icon: ICON,
      "icon-color": PALETTE_COLOR,
      "bg-color": PALETTE_COLOR,
      size: {
        type: "number",
        min: MIN_SHAPE_SIZE,
        max: MAX_SHAPE_SIZE,
        description: "In pixels, 40 by default.",
      },
      mask: { ...ICON, description: "An icon of the storefront's set whose outline cuts the shape." },
    },
    mapProps: (attributes) => ({
      icon: attributes.icon,
      iconColor: toPaletteColor(toText(attributes["icon-color"])),
      bgColor: toPaletteColor(toText(attributes["bg-color"])),
      size: typeof attributes.size === "number" ? `${attributes.size}px` : undefined,
      mask: attributes.mask,
    }),
    cost: SHAPE_COST,
  },
  "vc-property": {
    component: markRaw(VcProperty),
    description: "A label and its value on one line, joined by dots, as in a list of specifications.",
    attributes: {
      label: { type: "string" },
      value: { type: "string" },
    },
    mapProps: ({ label, value }) => ({ label: toText(label) ?? "", value }),
    cost: PROPERTY_COST,
  },
};

const BUILT_IN_BEHAVIORS: Record<BuiltInBehaviorNameType, ICustomSectionBehavior> = {
  inview: {
    directive: async () => (await import("../behaviors/inview")).vInview,
    description: "Sets data-visible while the element is on screen.",
    options: {
      threshold: {
        type: "number",
        min: 0,
        max: 1,
        description:
          "The share of the element on screen, each axis against the screen where the element is larger; " +
          `${DEFAULT_INVIEW_THRESHOLD} by default.`,
      },
      once: { type: "boolean", description: "data-visible stays once set." },
    },
    writes: ["data-visible"],
    fallbackAttributes: ["data-visible"],
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
      duration: {
        type: "number",
        min: 0,
        max: 5000,
        description: `In milliseconds, ${DEFAULT_COUNT_UP_DURATION} by default.`,
      },
      decimals: { type: "number", min: 0, max: 4, description: "0 by default." },
    },
    writes: ["text"],
    textAttributes: ["data-count-up"],
  },
  countdown: {
    directive: async () => (await import("../behaviors/countdown")).vCountdown,
    description:
      "Elements with data-countdown-part, inside it or the element itself, show the time left until the date; " +
      "data-ended is set when it passes. " +
      "A date with no time ends at 00:00 UTC of that day, for every visitor alike; for another moment write a " +
      "date-time with its offset, such as 2026-12-24T18:00:00-05:00 or 2026-12-24T23:00:00Z. One without an " +
      "offset is refused.",
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
    description:
      "A click, or Enter or Space while it has focus, copies the text. Unless it is a link, it takes the button " +
      `role and the focus. Once copied, it sets data-copied for ${COPIED_DURATION / 1000} seconds and shows a ` +
      "notification; a copy the browser refuses says nothing.",
    value: { type: "string" },
    writes: ["data-copied"],
  },
  marquee: {
    directive: async () => (await import("../behaviors/marquee")).vMarquee,
    description:
      "The children are repeated once for a seamless loop. --marquee-width is the width of one run; animate " +
      "translate from 0 to var(--marquee-shift), which moves toward the inline start and reverses in " +
      "right-to-left text. The loop pauses, with data-paused set, while the pointer is over it or the focus inside; " +
      "with nothing to focus inside, the element itself takes focus.",
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

function toPaletteColor(color: string | undefined): string | undefined {
  return color && ((MAIN_COLORS as readonly string[]).includes(color) || PALETTE_VARIABLE_REGEX.test(color))
    ? color
    : undefined;
}
