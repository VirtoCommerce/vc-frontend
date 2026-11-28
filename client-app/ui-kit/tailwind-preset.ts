import containerQueries from "@tailwindcss/container-queries";
import defaultTheme from "tailwindcss/defaultTheme.js";
import { BREAKPOINTS } from "./constants/tailwind.js";
import type { Config } from "tailwindcss";

// The kit's design system: the palette names, screens and the shape and type scales. The theme's
// `tailwind.config.ts` takes it as a preset and only adds to it under `theme.extend`.

// Scale tokens: `--vc-<property>-<tailwind key>` with today's value as the fallback. Classic sets none.
const vcToken = (name: string, value: string) => `var(--vc-${name}, ${value})`;

const tokenKey = (key: string) => (key === "DEFAULT" ? "default" : key);

// `defaultTheme` types each scale as `Config["theme"]` (value or function) & its record.
const tokenizeScale = (property: string, scale: object, skip: string[] = []) =>
  Object.fromEntries(
    Object.entries(scale as Record<string, string>)
      .filter(([key]) => !skip.includes(key))
      .map(([key, value]) => [key, vcToken(`${property}-${tokenKey(key)}`, value)]),
  );

type FontSizeType = [size: string, { lineHeight: string }];

const tokenizeFontSizes = (scale: Record<string, FontSizeType>) =>
  Object.fromEntries(
    Object.entries(scale).map(([key, [size, { lineHeight }]]): [string, FontSizeType] => [
      key,
      [vcToken(`font-size-${key}`, size), { lineHeight: vcToken(`line-height-${key}`, lineHeight) }],
    ]),
  );

// One token per part: Tailwind derives `--tw-shadow-colored` from each part's fallback, so
// `shadow-<colour>` keeps classic geometry.
const tokenizeShadows = (scale: Record<string, string[]>) =>
  Object.fromEntries(
    Object.entries(scale).map(([key, parts]) => [
      key,
      parts.map((part, index) => vcToken(`shadow-${tokenKey(key)}-${index + 1}`, part)).join(", "),
    ]),
  );

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const paletteColor = (name: string, shade: number) => `rgb(from var(--color-${name}-${shade}) r g b / <alpha-value>)`;

const palette = (name: string, shades: readonly number[] = SHADES): Record<string, string> => ({
  ...(shades.includes(500) ? { DEFAULT: paletteColor(name, 500) } : {}),
  ...Object.fromEntries(shades.map((shade) => [shade, paletteColor(name, shade)])),
});

const colors = {
  transparent: "transparent",
  current: "currentColor",
  inherit: "inherit",

  primary: palette("primary"),
  secondary: palette("secondary"),
  info: palette("info"),
  success: palette("success"),
  warning: palette("warning"),
  danger: palette("danger"),
  neutral: palette("neutral"),
  accent: palette("accent"),
  additional: palette("additional", [50, 950]),
};

const colorSet = {
  colors,
  backgroundColor: colors,
  textColor: colors,
  textDecorationColor: colors,
  boxShadowColor: colors,

  borderColor: {
    ...colors,
    DEFAULT: colors.neutral[300],
  },

  divideColor: {
    ...colors,
    DEFAULT: colors.neutral[300],
  },

  outlineColor: {
    ...colors,
    DEFAULT: colors.primary[100],
  },

  ringColor: {
    ...colors,
    DEFAULT: colors.primary[100],
  },
};

export const uiKitPreset = {
  theme: {
    ...colorSet,
    screens: BREAKPOINTS,
    fontFamily: {
      lato: ["Lato", "sans-serif"],
      base: vcToken("base-font-family", "Lato, sans-serif"),
      heading: vcToken("heading-font-family", "inherit"),
    },

    fontSize: tokenizeFontSizes({
      xxs: [
        "0.625rem", //10px
        {
          lineHeight: "0.75rem", //12px
        },
      ],
      xs: [
        "0.75rem", //12px
        {
          lineHeight: "0.875rem", //14px
        },
      ],
      sm: [
        "0.875rem", //14px
        {
          lineHeight: "1.125rem", //18px
        },
      ],
      base: [
        "1rem", //16px
        {
          lineHeight: "1.25rem", //20px
        },
      ],
      lg: [
        "1.125rem", //18px
        {
          lineHeight: "1.375rem", //22px
        },
      ],
      xl: [
        "1.25rem", //20px
        {
          lineHeight: "1.75rem", //28px
        },
      ],
      "2xl": [
        "1.5rem", //24px
        {
          lineHeight: "2rem", //32px
        },
      ],
      "3xl": [
        "1.875rem", //30px
        {
          lineHeight: "2.25rem", //36px
        },
      ],
      "4xl": [
        "2.25rem", //36px
        {
          lineHeight: "2.5rem", //40px
        },
      ],
      "5xl": [
        "3rem", //48px
        {
          lineHeight: "3rem", //48px
        },
      ],
      "6xl": [
        "3.75rem", //60px
        {
          lineHeight: "3.75rem", //60px
        },
      ],
      "7xl": [
        "4.5rem", //72px
        {
          lineHeight: "4.5rem", //72px
        },
      ],
      "8xl": [
        "6rem", //96px
        {
          lineHeight: "6rem", //96px
        },
      ],
    }),

    extend: {
      ...colorSet,

      borderRadius: tokenizeScale("radius", defaultTheme.borderRadius, ["none", "full"]),

      lineHeight: tokenizeScale("line-height", defaultTheme.lineHeight),

      fontWeight: tokenizeScale("font-weight", defaultTheme.fontWeight),

      letterSpacing: tokenizeScale("letter-spacing", defaultTheme.letterSpacing),

      containers: {
        xxs: "14rem", //224px
      },

      spacing: {
        4.5: "1.125rem", //18px
        17: "4.25rem", //68px
        18: "4.5rem", //72px
        19: "4.75rem", //76px
      },

      boxShadow: tokenizeShadows({
        DEFAULT: defaultTheme.boxShadow.DEFAULT.split(", "),
        0: [
          "0 1px 3px 0 rgb(from var(--color-additional-950) r g b / 0.1)",
          "0 1px 2px -1px rgb(from var(--color-additional-950) r g b / 0.1)",
        ],
        sm: ["0 1px 2px 0 rgb(from var(--color-additional-950) r g b / 0.05)"],
        md: [
          "0 4px 6px 0 rgb(from var(--color-additional-950) r g b / 0.1)",
          "0 2px 4px -2px rgb(from var(--color-additional-950) r g b / 0.1)",
        ],
        lg: [
          "0 6px 15px 0 rgb(from var(--color-additional-950) r g b / 0.1)",
          "0 4px 6px -4px rgb(from var(--color-additional-950) r g b / 0.1)",
        ],
        xl: [
          "0 8px 25px 0 rgb(from var(--color-additional-950) r g b / 0.1)",
          "0 8px 10px -6px rgb(from var(--color-additional-950) r g b / 0.1)",
        ],
        "2xl": ["0 10px 50px 0 rgb(from var(--color-additional-950) r g b / 0.25)"],
        inner: ["inset 0 2px 4px 0 rgb(from var(--color-additional-950) r g b / 0.05)"],
      }),
    },
  },

  plugins: [containerQueries],
} satisfies Partial<Config>;
