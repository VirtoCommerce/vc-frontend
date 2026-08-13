<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && hasComponent(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!-- A component-less entry decorates this fallback instead of replacing it. -->
  <slot v-else v-bind="{ extensionProps: contributed }" />
</template>

<script lang="ts">
import { effectScope, onScopeDispose, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType, ContributionType } from "@/shared/common/types/extensionRegistryMap";
import type { EffectScope } from "vue";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  name?: string;
  /** Passed to the entry's `condition`. Declining leaves the fallback rendered but undecorated. */
  conditionParameter?: ConditionParamType<C>;
}
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps<C>>();

const { getComponent, getContribution, getProps, hasComponent, passesCondition } = useExtensionRegistry();

// `use()` runs in setup, in a scope stopped when the name changes or this unmounts.
const contributed = shallowRef<ContributionType<C>>();

let scope: EffectScope | undefined;

function stopContribution() {
  scope?.stop();
  scope = undefined;
  contributed.value = undefined;
}

watch(
  () => [props.name, props.conditionParameter] as const,
  ([name, conditionParameter]) => {
    stopContribution();

    // A component replaces the fallback, so nothing would read a contribution.
    if (!name || hasComponent(props.category, name)) {
      return;
    }

    const use = passesCondition(props.category, name, conditionParameter as ConditionParamType<C>)
      ? getContribution(props.category, name)
      : undefined;

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
