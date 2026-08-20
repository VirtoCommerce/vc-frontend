<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && isRegistered(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!--
    A component-less entry decorates the fallback instead of replacing it. The contribution runs in
    ExtensionContribution's setup, keyed by name so a new entry gets a fresh one.
  -->
  <ExtensionContribution v-else-if="contribution && $slots.default" :key="name" :use="contribution">
    <!-- The cast re-states what ExtensionContribution was handed: a generic slot prop arrives
         ref-unwrapped, which does not reduce while C is still open. -->
    <template #default="{ extensionProps }">
      <slot v-bind="{ extensionProps: extensionProps as ContributionType<C> }" />
    </template>
  </ExtensionContribution>

  <slot v-else v-bind="{ extensionProps: undefined }" />
</template>

<script lang="ts">
import { computed, useSlots, watch } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType, ContributionType } from "@/shared/common/types/extensionRegistryMap";

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
import ExtensionContribution from "@/shared/common/components/extension-contribution.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps<C>>();

defineSlots<{
  /** The host's own markup, decorated with whatever the entry contributed. */
  default?(props: { extensionProps?: ContributionType<C> }): unknown;
}>();

const { getComponent, getContribution, getProps, isRegistered, passesCondition } = useExtensionRegistry();

const slots = useSlots();

// A computed so the template tracks the registry as well as the props: an entry registered after
// this point starts its contribution instead of staying dark until the next remount.
const contribution = computed(() => {
  const { category, name, conditionParameter } = props;

  // A component replaces the fallback, so nothing would read a contribution.
  if (!name || isRegistered(category, name)) {
    return undefined;
  }

  return passesCondition(category, name, conditionParameter as ConditionParamType<C>)
    ? getContribution(category, name)
    : undefined;
});

// Without a fallback slot nothing can read `extensionProps`, so the contribution is not started at
// all — fetching for a renderer that does not exist is the silent no-op the type gate misses when
// the category is not a literal.
if (IS_DEVELOPMENT) {
  watch(
    contribution,
    (use) => {
      if (use && !slots.default) {
        Logger.warn(
          `ExtensionPoint: "${String(props.category)}/${String(props.name)}" contributes data, but this extension point renders no fallback slot to receive it. Register a component instead, or give the call site a fallback.`,
        );
      }
    },
    { immediate: true },
  );
}
</script>
