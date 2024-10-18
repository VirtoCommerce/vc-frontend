import { BREAKPOINTS } from "./client-app/core/constants/tailwind";
import type { Config } from "tailwindcss";

const primaryColors = {
  DEFAULT: "rgb(from var(--color-primary-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-primary-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-primary-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-primary-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-primary-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-primary-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-primary-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-primary-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-primary-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-primary-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-primary-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-primary-950) r g b / <alpha-value>)",
};

const secondaryColors = {
  DEFAULT: "rgb(from var(--color-secondary-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-secondary-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-secondary-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-secondary-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-secondary-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-secondary-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-secondary-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-secondary-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-secondary-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-secondary-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-secondary-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-secondary-950) r g b / <alpha-value>)",
};

const infoColors = {
  DEFAULT: "rgb(from var(--color-info-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-info-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-info-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-info-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-info-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-info-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-info-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-info-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-info-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-info-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-info-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-info-950) r g b / <alpha-value>)",
};

const successColors = {
  DEFAULT: "rgb(from var(--color-success-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-success-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-success-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-success-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-success-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-success-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-success-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-success-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-success-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-success-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-success-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-success-950) r g b / <alpha-value>)",
};

const warningColors = {
  DEFAULT: "rgb(from var(--color-warning-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-warning-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-warning-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-warning-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-warning-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-warning-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-warning-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-warning-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-warning-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-warning-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-warning-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-warning-950) r g b / <alpha-value>)",
};

const dangerColors = {
  DEFAULT: "rgb(from var(--color-danger-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-danger-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-danger-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-danger-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-danger-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-danger-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-danger-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-danger-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-danger-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-danger-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-danger-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-danger-950) r g b / <alpha-value>)",
};

const neutralColors = {
  DEFAULT: "rgb(from var(--color-neutral-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-neutral-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-neutral-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-neutral-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-neutral-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-neutral-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-neutral-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-neutral-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-neutral-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-neutral-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-neutral-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-neutral-950) r g b / <alpha-value>)",
};

const accentColors = {
  DEFAULT: "rgb(from var(--color-accent-500) r g b / <alpha-value>)",
  50: "rgb(from var(--color-accent-50) r g b / <alpha-value>)",
  100: "rgb(from var(--color-accent-100) r g b / <alpha-value>)",
  200: "rgb(from var(--color-accent-200) r g b / <alpha-value>)",
  300: "rgb(from var(--color-accent-300) r g b / <alpha-value>)",
  400: "rgb(from var(--color-accent-400) r g b / <alpha-value>)",
  500: "rgb(from var(--color-accent-500) r g b / <alpha-value>)",
  600: "rgb(from var(--color-accent-600) r g b / <alpha-value>)",
  700: "rgb(from var(--color-accent-700) r g b / <alpha-value>)",
  800: "rgb(from var(--color-accent-800) r g b / <alpha-value>)",
  900: "rgb(from var(--color-accent-900) r g b / <alpha-value>)",
  950: "rgb(from var(--color-accent-950) r g b / <alpha-value>)",
};

const additionalColors = {
  50: "rgb(from var(--color-additional-50) r g b / <alpha-value>)",
  950: "rgb(from var(--color-additional-950) r g b / <alpha-value>)",
};

const colors = {
  transparent: "transparent",
  current: "currentColor",
  inherit: "inherit",

  primary: primaryColors,
  secondary: secondaryColors,
  info: infoColors,
  success: successColors,
  warning: warningColors,
  danger: dangerColors,
  neutral: neutralColors,
  accent: accentColors,
  additional: additionalColors,
};

const colorSet = {
  colors,
  backgroundColor: colors,
  textColor: colors,
  textDecorationColor: colors,
  boxShadowColor: colors,

  borderColor: {
    ...colors,
    DEFAULT: neutralColors[200],
  },

  divideColor: {
    ...colors,
    DEFAULT: neutralColors[200],
  },

  outlineColor: {
    ...colors,
    DEFAULT: primaryColors[100],
  },

  ringColor: {
    ...colors,
    DEFAULT: primaryColors[100],
  },
};

module.exports = {
  content: ["./index.html", "./client-app/**/*.{vue,js,ts,jsx,tsx}", "./node_modules/tw-elements/dist/js/**/*.js"],

  theme: {
    ...colorSet,
    screens: BREAKPOINTS,
    fontFamily: {
      lato: ["Lato", "sans-serif"],

      /*
       * @deprecated fonts
       * */
      roboto: ["Roboto", "sans-serif"],
      "roboto-condensed": ["Roboto Condensed", "sans-serif"],
    },

    fontSize: {
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
    },

    extend: {
      ...colorSet,

      containers: {
        xxs: "14rem", //224px
      },

      spacing: {
        4.5: "1.125rem", //18px
        17: "4.25rem", //68px
        18: "4.5rem", //72px
        19: "4.75rem", //76px
      },

      maxHeight: {
        "screen-60": "60vh",
        "screen-75": "75vh",
      },
    },
  },

  plugins: [require("@tailwindcss/container-queries"), require("tw-elements/dist/plugin.cjs")],
} satisfies Config;
