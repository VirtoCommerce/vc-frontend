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

## Deprecating a Prop Value

When deprecating a specific *value* of a prop (e.g. renaming a `variant` option `solid-light` → `soft`, or a `color`/`size` value) while keeping the prop itself, the old value must keep working during the deprecation period.

### 1. Type declarations (`*.types.d.ts`)

Add the new value to the union and keep the old one with a JSDoc `@deprecated` tag (canonical values first, deprecated aliases last):

```ts
type VcButtonVariantType =
  | "solid"
  | "soft"
  /** @deprecated Use "soft" instead. */
  | "solid-light";
```

### 2. Runtime normalization (`*.vue`)

Map the deprecated value to its canonical replacement before using it in the template, and emit a one-time dev warning. Use the shared `resolveVariant` helper (`ui-kit/utilities/variant-compat.ts`), which dedupes warnings per `(component, value)` pair behind `import.meta.env.DEV`:

```ts
const canonicalVariant = computed(() => resolveVariant("VcButton", props.variant));
```

Render using the canonical value (e.g. in the `:class` binding) so styles only need to target canonical names. Add new deprecated→canonical pairs to `LEGACY_VARIANT_MAP` in `variant-compat.ts`.

### 3. Documentation

- Add the deprecated aliases to the relevant `argType` `description` in the story file (keep the control `options` listing only canonical values — do not offer deprecated values in the control).
- Add the pairs to the component's `Deprecations` story (see below).

## The `Deprecations` Story

Every component that has *any* deprecated API surface — deprecated prop values, renamed props, renamed slots or events — gets a single story exported as `Deprecations`. It renders each deprecated item next to its canonical replacement so reviewers can confirm they behave identically, and it triggers the dev console warnings live.

Tag the story with `tags: ["deprecated"]` so `storybook-addon-tag-badges` shows the **Deprecated** badge on the `Deprecations` node in the sidebar. This is how a *partial* deprecation surfaces in the sidebar: the badge sits on the story, not the component.

> **Component vs. partial deprecation.** A fully deprecated component carries `tags: ["deprecated"]` on its **meta** (badge on the component node — see "Deprecating a Component"). A component that is still current but has deprecated props/values carries the tag on the **`Deprecations` story** instead. The sidebar has no per-prop node, so a single prop cannot be badged directly — the badged `Deprecations` story is the closest equivalent. For a fully deprecated *prop* you may additionally group it under a `table: { category: "Deprecated" }` in `argTypes`, which labels it in the Docs args table.

```ts
export const Deprecations: StoryType = {
  tags: ["deprecated"],
  parameters: {
    docs: {
      description: {
        story:
          "Deprecated API kept for backward compatibility. Each row shows the deprecated form next to its canonical replacement — they behave identically and emit a one-time dev console warning. Prefer the canonical form in new code.",
      },
    },
  },
  render: (args) => ({
    components: { VcButton },
    setup: () => ({ pairs: DEPRECATED_VARIANTS, args }),
    template: `<div class="space-y-6">
      <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center" v-for="pair in pairs" :key="pair.legacy">
        <VcButton v-bind="args" :variant="pair.legacy">{{ pair.legacy }}</VcButton>
        <div class="text-neutral-400">→</div>
        <VcButton v-bind="args" :variant="pair.canonical">{{ pair.canonical }}</VcButton>
      </div>
    </div>`,
  }),
};
```

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

Prop value deprecation:
- [ ] *.types.d.ts — new value added, old value /** @deprecated */ in the union
- [ ] *.vue — value normalized via resolveVariant (or equivalent), renders canonical
- [ ] variant-compat.ts — deprecated→canonical pair added to LEGACY_VARIANT_MAP
- [ ] *.stories.ts — argType description lists aliases; Deprecations story (tags: ["deprecated"]) shows old→new pairs
- [ ] Backward compatibility maintained
```
