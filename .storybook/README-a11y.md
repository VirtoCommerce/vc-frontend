# Accessibility Configuration Guide for Storybook

## Overview

This guide explains how to use the accessibility (a11y) checker in our Storybook setup with @storybook/addon-a11y.

## Configuration Structure

### Main Files

- **`.storybook/a11y-config.ts`** - Central configuration file with all a11y settings
- **`.storybook/preview.ts`** - Imports and applies global a11y configuration
- **`.storybook/example-a11y-usage.ts`** - Examples of different configuration scenarios

## Global Configuration

By default, all stories are checked against:

- ✅ **WCAG 2.0 Level AA** - Standard accessibility compliance
- ✅ **WCAG 2.1 Level AA** - Modern accessibility standards
- ✅ **WCAG 2.2 Level AA** - Latest accessibility standards (2023)
- ✅ **Best Practices** - Additional checks beyond WCAG
- ❌ **WCAG Level AAA** - Highest standard (disabled by default, enable for critical components)

## Available Parameters

### Core Parameters

```typescript
parameters: {
  a11y: {
    // Axe-core configuration
    config: {
      rules: [...],        // Rule configuration (enable/disable specific rules)
    },

    // Axe-core options
    options: {
      runOnly: {...},      // Limit which rules to run using tags
      resultTypes: [...],  // Types of results to return
      exclude: [...],      // Elements to exclude from checks
    },

    // What to check (replaces deprecated 'element' parameter)
    context: string | object,  // CSS selector, element, or include/exclude config

    // Behavior
    manual: boolean,       // Manual mode (don't run automatically)
    disable: boolean,      // Disable checks entirely
  }
}
```

## Using A11y in Stories

### 1. Basic Usage

All stories automatically inherit global configuration. No additional setup needed.

### 2. Component-Specific Configurations

Use predefined configurations from `componentConfigs`:

```typescript
import { componentConfigs } from "@/.storybook/a11y-config";

export const MyModalStory: StoryObj = {
  parameters: {
    a11y: componentConfigs.modals, // Uses modal-specific checks
  },
};
```

Available configurations:

- `componentConfigs.modals` - For modal/dialog components
- `componentConfigs.forms` - For form components
- `componentConfigs.navigation` - For navigation components
- `componentConfigs.lowContrast` - For intentionally low-contrast designs
- `componentConfigs.development` - For WIP components

### 3. Custom Configuration

Override specific rules for a story:

```typescript
export const MyStory: StoryObj = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: false, // Disable specific rule
          },
        ],
      },
    },
  },
};
```

### 4. Icon-Only Buttons

Icon buttons require special attention:

```typescript
export const IconButton: StoryObj = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "aria-label", enabled: true },
          { id: "button-name", enabled: true },
        ],
      },
    },
  },
};
```

### 5. Disabled States

Ensure disabled elements are properly marked:

```typescript
export const DisabledButton: StoryObj = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "aria-disabled", enabled: true },
          { id: "focus-order-semantics", enabled: true },
        ],
      },
    },
  },
};
```

### 6. Skip A11y Checks

Use sparingly for decorative or incomplete components:

```typescript
import { skipA11y } from "@/.storybook/a11y-config";

export const DecorativeStory: StoryObj = {
  parameters: skipA11y,
};
```

### 7. Manual Mode

For dynamic components that need interaction before checking:

```typescript
export const DynamicStory: StoryObj = {
  parameters: {
    a11y: {
      manual: true, // Click "Run test" button manually
    },
  },
};
```

### 8. Testing Specific Elements

Check only specific parts of the component:

```typescript
export const FormStory: StoryObj = {
  parameters: {
    a11y: {
      context: "form", // Check only the form element
      // Or use include/exclude pattern:
      // context: {
      //   include: [["form"]],
      //   exclude: [[".decorative"]]
      // }
    },
  },
};
```

## Merging Configurations

Combine multiple configurations:

```typescript
import { mergeA11yConfigs, componentConfigs } from "@/.storybook/a11y-config";

export const ComplexFormStory: StoryObj = {
  parameters: {
    a11y: mergeA11yConfigs(componentConfigs.forms, componentConfigs.development, {
      config: {
        rules: [{ id: "duplicate-id", enabled: true }],
      },
    }),
  },
};
```

## Common Tags and Rule IDs

### WCAG Compliance Tags (use with runOnly)

- `wcag2a` - WCAG 2.0 Level A compliance
- `wcag2aa` - WCAG 2.0 Level AA compliance
- `wcag2aaa` - WCAG 2.0 Level AAA compliance
- `wcag21a` - WCAG 2.1 Level A compliance
- `wcag21aa` - WCAG 2.1 Level AA compliance
- `wcag22aa` - WCAG 2.2 Level AA compliance
- `best-practice` - Best practices beyond WCAG

### Specific Rule IDs (use in config.rules)

- `color-contrast` - Color contrast ratios (4.5:1 for normal text)
- `color-contrast-enhanced` - Enhanced contrast ratios (7:1)
- `aria-label` - ARIA labels presence
- `aria-valid-attr` - Valid ARIA attributes
- `aria-valid-attr-value` - Valid ARIA attribute values
- `aria-required-attr` - Required ARIA attributes
- `aria-roles` - Valid ARIA roles
- `button-name` - Button accessible names
- `label` - Form label associations
- `focus-order-semantics` - Focus order logic
- `nested-interactive` - No nested interactive elements
- `duplicate-id` - No duplicate IDs
- `duplicate-id-active` - No duplicate IDs on active elements
- `autocomplete-valid` - Valid autocomplete values
- `tabindex` - Valid tabindex values
- `heading-order` - Logical heading order
- `landmark-one-main` - One main landmark
- `region` - All content in landmarks
- `skip-link` - Skip navigation links
- `meta-viewport` - Valid viewport meta tag
- `scrollable-region-focusable` - Scrollable regions are keyboard accessible

## Viewing Results

1. **Panel Tab**: Click "Accessibility" tab in Storybook panel
2. **Visual Highlights**: Problematic elements are highlighted in the preview
3. **Violation Groups**: Issues grouped by rule type
4. **Share Links**: Each violation has a shareable link
5. **Manual Rerun**: Click "Rerun tests" for dynamic content

## Resources

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Storybook A11y Addon](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)
