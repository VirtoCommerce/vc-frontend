/**
 * Example of using custom a11y configuration in Storybook stories
 * This file demonstrates different ways to configure accessibility checks
 */

import { componentConfigs, mergeA11yConfigs, skipA11y } from "./a11y-config.ts";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

// Example component
type ExampleComponentType = {
  isOpen?: boolean;
  title?: string;
  variant?: string;
  content?: string;
};

/**
 * Example Meta configuration for entire component stories
 */
export default {
  title: "Example/AccessibleComponent",
  parameters: {
    // Apply to all stories in this component
    a11y: componentConfigs.forms,
  },
} as Meta<ExampleComponentType>;

type StoryType = StoryObj<ExampleComponentType>;

/**
 * Example 1: Using component-specific configuration
 * For a modal component that needs special focus management checks
 */
export const ModalStoryExample: StoryType = {
  args: {
    isOpen: true,
    title: "Example Modal",
  },
  parameters: {
    // Use predefined modal configuration
    a11y: componentConfigs.modals,
  },
};

/**
 * Example 2: Custom configuration for a specific story
 * For a component with known contrast issues that are intentional
 */
export const LowContrastStoryExample: StoryType = {
  args: {
    variant: "ghost",
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable color contrast check for this specific story
            id: "color-contrast",
            enabled: false,
          },
          {
            // But ensure ARIA labels are still correct
            id: "aria-label",
            enabled: true,
          },
        ],
      },
      // Optional: add a note about why contrast is disabled
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2aa", "best-practice"],
        },
      },
    },
  },
};

/**
 * Example 3: Merging multiple configurations
 * Combining global config with component-specific needs
 */
export const FormStoryExample: StoryType = {
  args: {
    // form props
    title: "Example Form",
  },
  parameters: {
    a11y: mergeA11yConfigs(componentConfigs.forms, componentConfigs.development, {
      // Additional custom rules for this story
      config: {
        rules: [
          {
            id: "duplicate-id",
            enabled: true,
          },
        ],
      },
    }),
  },
};

/**
 * Example 4: Skipping a11y checks entirely
 * Use sparingly, only for decorative or WIP components
 */
export const DecorativeComponentExample: StoryType = {
  args: {
    // component props
    variant: "decorative",
  },
  parameters: skipA11y,
};

/**
 * Example 5: Testing specific elements
 * Check only a specific part of the component
 */
export const PartialCheckExample: StoryType = {
  args: {
    // component props
    title: "Partial Check",
  },
  parameters: {
    a11y: {
      // Check only the form inside the component
      context: {
        include: [["form"]],
      },
      config: {
        rules: [
          {
            id: "label",
            enabled: true,
          },
        ],
      },
    },
  },
};

/**
 * Example 6: Manual mode for dynamic components
 * Useful for components that need user interaction before checking
 */
export const DynamicComponentExample: StoryType = {
  args: {
    // component props
    title: "Dynamic Component",
  },
  parameters: {
    a11y: {
      // Don't run automatically, wait for manual trigger
      manual: true,
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag21a", "wcag21aa"],
        },
      },
    },
  },
};

/**
 * Example 7: Handling third-party content
 * Exclude certain selectors from checks
 */
export const ThirdPartyContentExample: StoryType = {
  args: {
    // component props
    content: "Third party content here",
  },
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa"],
        },
        // Exclude third-party widgets from checks
        exclude: [[".third-party-widget"], ["iframe"], ["[data-third-party]"]],
      },
    },
  },
};

/**
 * Example 8: Testing different WCAG levels
 * Gradually increase accessibility standards
 */
export const ProgressiveEnhancementExample: StoryType = {
  args: {
    // component props
    title: "Progressive Enhancement",
  },
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          // Start with Level A, then add AA, and optionally AAA
          values: ["wcag2a", "wcag2aa"], // Add "wcag2aaa" when ready for highest standard
        },
      },
    },
  },
};

/**
 * Example 9: Focus management testing
 * Important for keyboard navigation
 */
export const FocusManagementExample: StoryType = {
  args: {
    title: "Focus Test",
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Check tab order
            id: "tabindex",
            enabled: true,
          },
          {
            // Check focus order semantics
            id: "focus-order-semantics",
            enabled: true,
          },
          {
            // Check that interactive elements are keyboard accessible
            id: "nested-interactive",
            enabled: true,
          },
        ],
      },
    },
  },
};

/**
 * Example 10: Testing with different viewport sizes
 * Ensures accessibility at different breakpoints
 */
export const ResponsiveAccessibilityExample: StoryType = {
  args: {
    title: "Responsive Component",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    a11y: {
      // Mobile-specific accessibility checks
      config: {
        rules: [
          {
            // Viewport meta tag
            id: "meta-viewport",
            enabled: true,
          },
          {
            // Scrollable region must have keyboard access
            id: "scrollable-region-focusable",
            enabled: true,
          },
        ],
      },
    },
  },
};

/**
 * Example 11: Complex form with multiple configurations
 * Shows how to combine multiple accessibility concerns
 */
export const ComplexFormExample: StoryType = {
  render: () => ({
    template: `
      <form>
        <label for="email">Email</label>
        <input id="email" type="email" required />

        <label for="password">Password</label>
        <input id="password" type="password" required />

        <fieldset>
          <legend>Options</legend>
          <input type="checkbox" id="option1" />
          <label for="option1">Option 1</label>
        </fieldset>

        <button type="submit">Submit</button>
      </form>
    `,
  }),
  parameters: {
    a11y: mergeA11yConfigs(componentConfigs.forms, {
      config: {
        rules: [
          {
            // Check form field labels
            id: "label",
            enabled: true,
          },
          {
            // Check required attributes
            id: "aria-required-attr",
            enabled: true,
          },
          {
            // Check for duplicate form labels
            id: "duplicate-id-active",
            enabled: true,
          },
        ],
      },
    }),
  },
};

/**
 * Example 12: Testing loading states
 * Ensures loading indicators are accessible
 */
export const LoadingStateExample: StoryType = {
  args: {
    title: "Loading...",
  },
  render: (args) => ({
    template: `
      <div>
        <h1>{{ args.title }}</h1>
        <div role="status" aria-live="polite">
          <span class="sr-only">Loading...</span>
          <div class="spinner"></div>
        </div>
      </div>
    `,
    setup() {
      return { args };
    },
  }),
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Check proper use of ARIA attributes in live regions
            id: "aria-valid-attr-value",
            enabled: true,
          },
          {
            // Check role usage
            id: "aria-roles",
            enabled: true,
          },
          {
            // Ensure aria-live regions are not empty
            id: "aria-text",
            enabled: true,
          },
        ],
      },
    },
  },
};
