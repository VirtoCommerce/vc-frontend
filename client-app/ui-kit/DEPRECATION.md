# Deprecating UI-Kit Components

This guide describes the standard process for deprecating UI-Kit components (or individual props).

## Deprecating a Component

When deprecating an entire component, follow these **6 steps**:

### 1. Story file (`*.stories.ts`)

Add `tags: ["deprecated"]` for the sidebar badge and `parameters.deprecated` with a migration message for the Docs page banner.

```ts
const meta: Meta<typeof VcSelect> = {
  title: "Components/Molecules/VcSelect",
  component: VcSelect,
  tags: ["deprecated"],
  parameters: {
    deprecated: "Use VcDropdownMenu with VcInput instead. See migration guide: <link>",
  },
};
```

### 2. Index file (`atoms/index.ts` | `molecules/index.ts` | `organisms/index.ts`)

Add a JSDoc `@deprecated` comment above the export. This enables IDE strikethrough on import and triggers `sonarjs/deprecation` lint warnings.

```ts
/** @deprecated Use VcDropdownMenu instead */
export { default as VcSelect } from "./select/vc-select.vue";
```

### 3. Type declarations (`atoms/types.d.ts` | `molecules/types.d.ts` | `organisms/types.d.ts`)

Add a JSDoc `@deprecated` comment above the type in `GlobalComponents`. This enables IDE strikethrough when the component is used in `<template>`.

```ts
/** @deprecated Use VcDropdownMenu instead */
VcSelect: typeof Components.VcSelect;
```

> **Important:** Use JSDoc `/** @deprecated */`, not a regular `// @deprecated` comment. Only JSDoc triggers IDE strikethrough and `sonarjs/deprecation` lint warnings.

### 4. Component file (`*.vue`)

Add a dev-only `console.warn` in `<script setup>` **after** `defineProps`/`withDefaults` (to avoid `vue/define-macros-order` lint errors). This warns developers who run the app locally.

```ts
defineProps<IProps>();

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn("[VcSelect] This component is deprecated. Use VcDropdownMenu instead.");
}
```

### 5. ESLint config (`eslint.config.js`)

Add the component to `vue/no-restricted-html-elements` to prevent new usage at lint time:

```js
"vue/no-restricted-html-elements": ["warn",
  { element: "VcSelect", message: "VcSelect is deprecated. Use VcDropdownMenu instead." },
],
```

### 6. Migration guide

For significant replacements, provide a migration guide — either inline in `parameters.deprecated` or as a linked document. The guide should include before/after code examples.

## Deprecating a Prop

When deprecating an individual prop (not the whole component), update **1 file**:

### Component file (`*.vue`)

Add a dev-only `console.warn` that checks if the deprecated prop is passed:

```ts
if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  if ("isRequired" in vnodeProps) {
    // eslint-disable-next-line no-console
    console.warn("VcDateSelector: 'isRequired' prop is deprecated, use 'required' instead.");
  }
}
```

Keep backward compatibility: the component should still work with the old prop during the deprecation period.

## Checklist

```
Component deprecation:
- [ ] *.stories.ts — tags: ["deprecated"] + parameters.deprecated with message
- [ ] index.ts — /** @deprecated */ JSDoc on export
- [ ] types.d.ts — /** @deprecated */ JSDoc on GlobalComponents entry
- [ ] *.vue — console.warn behind import.meta.env.DEV (after defineProps)
- [ ] eslint.config.js — vue/no-restricted-html-elements rule
- [ ] Migration guide provided

Prop deprecation:
- [ ] *.vue — console.warn behind import.meta.env.DEV with prop check
- [ ] Backward compatibility maintained
```
