<template>
  <template v-for="name in listedNames" :key="name">
    <!-- ExtensionPoint gates only contributions on `condition`, so a declining component entry is skipped here. -->
    <ExtensionPoint
      v-if="rendersEntry(name)"
      v-bind="$attrs"
      :category="category"
      :name="String(name)"
      :condition-parameter="conditionParams"
    >
      <!-- Forwarding an empty slot would tell every ExtensionPoint it has a fallback. -->
      <template v-if="$slots.default" #default="{ extensionProps }">
        <slot v-bind="{ name: String(name), entry: entries[name], extensionProps }" />
      </template>
    </ExtensionPoint>
  </template>
</template>

<script lang="ts">
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType } from "@/shared/common/types/extensionRegistryMap";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  names?: string[];
  /** Passed to each registered entry's `condition`; entries without a condition always render. */
  conditionParams?: ConditionParamType<C>;
}
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
import { computed } from "vue";
import { pendingSlotNames, reservationFor } from "@/modules/federated/contributions/declare";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<IProps<C>>();

const { getEntries, passesCondition } = useExtensionRegistry();

const entries = computed(() => getEntries(props.category, props.names) as Record<string, unknown>);

/**
 * The registered entries, plus the slots a still-pending plugin declared for this category, so a
 * `block` region holds its place before the plugin has registered anything.
 */
const listedNames = computed(() => {
  const pending = pendingSlotNames(props.category).filter((name) => !props.names || props.names.includes(name));
  return [...new Set([...Object.keys(entries.value), ...pending])];
});

function rendersEntry(name: string): boolean {
  const parameter = props.conditionParams as ConditionParamType<C>;
  if (name in entries.value) {
    return passesCondition(props.category, name, parameter);
  }
  return reservationFor(props.category, name, parameter) !== undefined;
}
</script>
