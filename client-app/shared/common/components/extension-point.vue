<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && hasComponent(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!-- A component-less entry contributes to the host's own fallback (e.g. a badge count)
       instead of replacing it. -->
  <slot v-else v-bind="{ extensionProps: contributed }" />
</template>

<script lang="ts">
import { effectScope, onScopeDispose, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ContributionType } from "@/shared/common/types/extensionRegistryMap";
import type { EffectScope } from "vue";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  name?: string;
}
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps<C>>();

const { getComponent, getContribution, getProps, hasComponent } = useExtensionRegistry();

// `use()` runs in setup, inside a scope stopped when the name changes or this unmounts, so a
// contribution may fetch or subscribe.
const contributed = shallowRef<ContributionType<C>>();

let scope: EffectScope | undefined;

function stopContribution() {
  scope?.stop();
  scope = undefined;
  contributed.value = undefined;
}

watch(
  () => props.name,
  (name) => {
    stopContribution();

    // A component replaces the fallback, so nothing would read the contribution anyway.
    const use = name && !hasComponent(props.category, name) ? getContribution(props.category, name) : undefined;

    if (!use) {
      return;
    }

    scope = effectScope(true);
    contributed.value = scope.run(() => {
      try {
        return use();
      } catch (error) {
        Logger.error(`ExtensionPoint: use() failed for "${String(props.category)}/${name}"`, error);
        return undefined;
      }
    });
  },
  { immediate: true },
);

onScopeDispose(stopContribution);
</script>
