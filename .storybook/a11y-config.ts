/**
 * Accessibility (a11y) configuration for Storybook
 * Based on axe-core and WCAG standards
 */

import type { Parameters } from "@storybook/vue3-vite";

/**
 * Global accessibility configuration for all stories
 */
export const a11yConfig: Parameters["a11y"] = {
  // Axe-core configuration
  config: {
    // Note: Individual WCAG level rules don't exist as rule IDs
    // They are handled through tags in options.runOnly
    rules: [
      // Specific rule overrides can be added here
      // Example:
      // {
      //   id: "color-contrast",
      //   enabled: true,
      // },
    ],
  },

  // Options for the accessibility checker
  options: {
    // Run only specific rule sets using tags
    runOnly: {
      type: "tag",
      // Correct tag values according to axe-core documentation
      // Including WCAG 2.2 for latest accessibility standards
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    },
    // Results types to include in output
    resultTypes: ["violations", "passes", "incomplete", "inapplicable"],
    // Rules to run (can override specific rules here)
    rules: {},
  },

  // Context to check (which part of the DOM to check)
  // Default is #storybook-root, can be overridden per story
  context: "#storybook-root",

  // Disable automatic check on story change (manual mode)
  manual: false,

  // Restore scroll position after check
  restoreScroll: true,
};

/**
 * Component-specific configurations
 * Use these as templates for specific story parameters
 */
export const componentConfigs = {
  // For components with known color contrast limitations
  lowContrast: {
    config: {
      rules: [
        {
          id: "color-contrast",
          enabled: false,
        },
        {
          id: "color-contrast-enhanced",
          enabled: false,
        },
      ],
    },
  },

  // For components in development
  development: {
    options: {
      runOnly: {
        type: "tag",
        // Only run basic WCAG 2.0 Level A & AA checks for WIP components
        values: ["wcag2a", "wcag2aa"],
      },
    },
  },

  // For form components
  forms: {
    config: {
      rules: [
        {
          // Ensure form labels are properly associated
          id: "label",
          enabled: true,
        },
        {
          // Check form field names
          id: "autocomplete-valid",
          enabled: true,
        },
      ],
    },
  },

  // For modal/dialog components
  modals: {
    config: {
      rules: [
        {
          // Check ARIA attributes are valid
          id: "aria-valid-attr",
          enabled: true,
        },
        {
          // Check ARIA values are valid
          id: "aria-valid-attr-value",
          enabled: true,
        },
        {
          // Check required ARIA attributes
          id: "aria-required-attr",
          enabled: true,
        },
      ],
    },
    // Check the modal container specifically
    context: {
      include: [["[role='dialog']"], ["[role='alertdialog']"]],
    },
  },

  // For navigation components
  navigation: {
    config: {
      rules: [
        {
          // Check landmark regions
          id: "landmark-one-main",
          enabled: true,
        },
        {
          // Check navigation structure
          id: "region",
          enabled: true,
        },
        {
          // Check for proper heading order
          id: "heading-order",
          enabled: true,
        },
        {
          // Check skip links
          id: "skip-link",
          enabled: true,
        },
      ],
    },
  },
};

/**
 * Helper function to merge configurations
 * Useful for combining global and component-specific configs
 */
export function mergeA11yConfigs(...configs: Array<Parameters["a11y"]>): Parameters["a11y"] {
  return configs.reduce(
    (merged, config) => {
      if (!config) return merged;

      return {
        ...merged,
        ...config,
        config: {
          ...merged?.config,
          ...config?.config,
          rules: [...(merged?.config?.rules || []), ...(config?.config?.rules || [])].filter(
            (rule, index, self) => index === self.findIndex((r) => r.id === rule.id),
          ),
        },
        options: {
          ...merged?.options,
          ...config?.options,
        },
      };
    },
    {} as Parameters["a11y"],
  );
}

/**
 * Skip accessibility checks for specific conditions
 * Use in story parameters when needed
 */
export const skipA11y = {
  a11y: {
    disable: true,
  },
};

/**
 * Common exclusion patterns for elements that should not be checked
 * (e.g., third-party widgets, decorative elements)
 * Use with context.exclude in parameters
 */
export const excludeSelectors = [
  [".decorative"],
  ["[aria-hidden='true']"],
  [".third-party-widget"],
  ["[role='presentation']"],
];
