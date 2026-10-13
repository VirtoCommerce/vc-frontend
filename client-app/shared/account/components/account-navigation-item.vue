<template>
  <VcMenuItem color="secondary" :active="isActive" :to="item.route" class="account-navigation-item">
    <template #prepend>
      <VcIcon size="sm" :name="item.icon" />
    </template>

    {{ formatTextFunction(item?.title) }}

    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </VcMenuItem>

  <slot />
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useLink, useRoute } from "vue-router";
import { isMenuLinkActive } from "@/core/utilities/menu";
import type { ExtendedMenuLinkType } from "@/core/types";

const props = withDefaults(defineProps<IProps>(), {
  formatTextFunction: (text: string | undefined) => text ?? "",
});

const item = toRef(props, "item");

const route = useRoute();
const { isActive: isRouteRecordActive } = useLink({ to: item.value?.route ?? {} });

const isActive = computed(() => isMenuLinkActive(item.value, route, isRouteRecordActive.value));

interface IProps {
  item: ExtendedMenuLinkType;
  formatTextFunction?: (text: string | undefined) => string;
}
</script>

<style lang="scss">
.account-navigation-item {
  @apply rounded-md;
}
</style>
