import { BREAKPOINTS } from "./client-app/core/constants/tailwind";
import type { Config } from "tailwindcss";

module.exports = {
  content: ["./index.html", "./client-app/**/*.{vue,js,ts,jsx,tsx}", "./node_modules/tw-elements/dist/js/**/*.js"],

  theme: {
    screens: BREAKPOINTS,
    fontFamily: {
      lato: ["Lato", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
      "roboto-condensed": ["Roboto Condensed", "sans-serif"],
    },

    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary-500)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },

        secondary: {
          DEFAULT: "var(--color-secondary-500)",
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },

        info: {
          DEFAULT: "var(--color-info-500)",
          50: "var(--color-info-50)",
          100: "var(--color-info-100)",
          200: "var(--color-info-200)",
          300: "var(--color-info-300)",
          400: "var(--color-info-400)",
          500: "var(--color-info-500)",
          600: "var(--color-info-600)",
          700: "var(--color-info-700)",
          800: "var(--color-info-800)",
          900: "var(--color-info-900)",
          950: "var(--color-info-950)",
        },

        success: {
          DEFAULT: "var(--color-success-500)",
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          200: "var(--color-success-200)",
          300: "var(--color-success-300)",
          400: "var(--color-success-400)",
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
          800: "var(--color-success-800)",
          900: "var(--color-success-900)",
          950: "var(--color-success-950)",
        },

        warning: {
          DEFAULT: "var(--color-warning-500)",
          50: "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          200: "var(--color-warning-200)",
          300: "var(--color-warning-300)",
          400: "var(--color-warning-400)",
          500: "var(--color-warning-500)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
          800: "var(--color-warning-800)",
          900: "var(--color-warning-900)",
          950: "var(--color-warning-950)",
        },

        danger: {
          DEFAULT: "var(--color-danger-500)",
          50: "var(--color-danger-50)",
          100: "var(--color-danger-100)",
          200: "var(--color-danger-200)",
          300: "var(--color-danger-300)",
          400: "var(--color-danger-400)",
          500: "var(--color-danger-500)",
          600: "var(--color-danger-600)",
          700: "var(--color-danger-700)",
          800: "var(--color-danger-800)",
          900: "var(--color-danger-900)",
          950: "var(--color-danger-950)",
        },

        neutral: {
          DEFAULT: "var(--color-neutral-500)",
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },

        accent: {
          DEFAULT: "var(--color-accent-500)",
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
          950: "var(--color-accent-950)",
        },

        additional: {
          50: "var(--color-additional-50)",
          950: "var(--color-additional-950)",
        },
      },

      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "0": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        none: "0 0 #0000",

        /** @deprecated Use the shadows listed above */
        "t-3sm": "1px 2px 4px rgba(0, 0, 0, 0.05)",
        "md-x": "1px 2px 8px rgba(0, 0, 0, 0.05)",
        "t-mds": "1px 1px 3px rgba(0, 0, 0, 0.25)",
        "t-lgs": "0px -8px 15px rgba(0, 0, 0, 0.1)",
        "sm-x-y": "1px 2px 9px rgba(0, 0, 0, 0.1)",
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

        /** @deprecated Use the fonts listed above */

        11: [
          "0.6875rem", //11px
          {
            lineHeight: "0.875rem", //14px
          },
        ],
        13: [
          "0.8125rem", //13px
          {
            lineHeight: "1.25rem", //20px
          },
        ],
        14: [
          "0.875rem", //14px
          {
            lineHeight: "1.25rem", //20px
          },
        ],
        15: [
          "0.9375rem", //15px
          {
            lineHeight: "1.25rem", //20px
          },
        ],
        17: [
          "1.0625rem", //17px
          {
            lineHeight: "1.25rem", //20px
          },
        ],
        18: [
          "1.125rem", //18px
          {
            lineHeight: "1.5rem", //24px
          },
        ],
        19: [
          "1.1875rem", //19px
          {
            letterSpacing: "0.01em",
            lineHeight: "1.438rem", //23px
          },
        ],
        21: [
          "1.3125rem", //21px
          {
            letterSpacing: "0.01em",
            lineHeight: "1.563rem", //25px
          },
        ],
        25: [
          "1.5625rem", //25px
          {
            lineHeight: "1.875rem", //30px
            letterSpacing: "0.02em",
          },
        ],
        26: [
          "1.625rem", //26px
          {
            lineHeight: "2.063rem", //33px
          },
        ],
        28: [
          "1.75rem", //28px
          {
            letterSpacing: "0.02em",
            lineHeight: "2.125rem", //34px
          },
        ],
        34: [
          "2.125rem", //34px
          {
            letterSpacing: "0.02em",
            lineHeight: "2.563rem", //41px
          },
        ],
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

  plugins: [require("tw-elements/dist/plugin.cjs")],
} satisfies Config;
