<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && isRegistered(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!-- A component-less entry decorates this fallback instead of replacing it. -->
  <slot v-else v-bind="{ extensionProps: contributed }" />
</template>

<script lang="ts">
import { computed, effectScope, onScopeDispose, shallowRef, useSlots, watch } from "vue";
import { IS_DEVELOPMENT } from "@/core/constants";
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

const { getComponent, getContribution, getProps, isRegistered, passesCondition } = useExtensionRegistry();

const slots = useSlots();

// `use()` runs in setup, in a scope stopped when the name changes or this unmounts.
const contributed = shallowRef<ContributionType<C>>();

let scope: EffectScope | undefined;

function stopContribution() {
  scope?.stop();
  scope = undefined;
  contributed.value = undefined;
}

// A computed so the effect below tracks the registry as well as the props: an entry registered
// after this point starts its contribution instead of staying dark until the next remount.
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

watch(
  contribution,
  (use) => {
    stopContribution();

    if (!use) {
      return;
    }

    // Without a fallback slot nothing can read `extensionProps` — fetching for a renderer that
    // does not exist is the silent no-op the type gate misses when the category is not a literal.
    if (!slots.default) {
      if (IS_DEVELOPMENT) {
        Logger.warn(
          `ExtensionPoint: "${String(props.category)}/${String(props.name)}" contributes data, but this extension point renders no fallback slot to receive it. Register a component instead, or give the call site a fallback.`,
        );
      }
      return;
    }

    scope = effectScope(true);

    try {
      contributed.value = scope.run(() => {
        const contribution = use();

        // The type says use() is sync, but a plugin is plain JS at the boundary.
        if (contribution instanceof Promise) {
          void contribution.catch((error: unknown) => {
            Logger.error(`ExtensionPoint: use() rejected for "${String(props.category)}/${String(props.name)}"`, error);
          });
        }

        return contribution;
      });
    } catch (error) {
      Logger.error(`ExtensionPoint: use() failed for "${String(props.category)}/${String(props.name)}"`, error);
      // Whatever use() created before it threw would keep running in a scope nobody stops.
      stopContribution();
    }
  },
  { immediate: true },
);

onScopeDispose(stopContribution);
</script>
