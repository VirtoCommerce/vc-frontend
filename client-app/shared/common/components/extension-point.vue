<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && isRegistered(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!-- An entry may contribute to the host's own fallback (e.g. a badge count) instead of
       replacing it, through `props` or `use()`. -->
  <slot v-else v-bind="{ extensionProps }" />
</template>

<script lang="ts">
import { computed, effectScope, onScopeDispose, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType, ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";
import type { EffectScope } from "vue";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  name?: string;
}

type ContributedType<C extends ExtensionCategoryType> =
  NonNullable<ExtensionRegistryStateType[C][string]["use"]> extends () => infer R
    ? R extends object
      ? R
      : Record<string, never>
    : Record<string, never>;

/** What the fallback slot receives: the entry's static props merged with its `use()` result. */
type SlotPropsType<C extends ExtensionCategoryType> = NonNullable<ExtensionRegistryStateType[C][string]["props"]> &
  ContributedType<C>;
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps<C>>();

const { getComponent, getContribution, getProps, isRegistered } = useExtensionRegistry();

// `use()` runs in setup, inside a scope stopped when the name changes or this unmounts, so a
// contribution may open a subscription.
const contributed = shallowRef<object>();

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

    const use = name ? getContribution(props.category, name) : undefined;

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

const extensionProps = computed<SlotPropsType<C> | undefined>(() => {
  const registered = props.name ? getProps(props.category, props.name) : undefined;
  const used = contributed.value;

  if (!registered && !used) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- vue-tsc rejects the merge without it
  return Object.assign({}, registered, used) as SlotPropsType<C>;
});
</script>
