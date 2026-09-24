<template>
  <template v-for="(entry, name) in getEntries(category, names)" :key="name">
    <!-- ExtensionPoint gates only contributions on `condition`, so a declining component entry is skipped here. -->
    <ExtensionPoint
      v-if="passesCondition(category, String(name), conditionParams as ConditionParamType<C>)"
      v-bind="$attrs"
      :category="category"
      :name="String(name)"
      :condition-parameter="conditionParams"
    >
      <!-- Forwarding an empty slot would tell every ExtensionPoint it has a fallback. -->
      <template v-if="$slots.default" #default="{ extensionProps }">
        <slot v-bind="{ name: String(name), entry, extensionProps }" />
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
import ExtensionPoint from "@/shared/common/components/extension-point.vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps<C>>();

const { getEntries, passesCondition } = useExtensionRegistry();
</script>
