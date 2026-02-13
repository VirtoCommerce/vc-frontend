<template>
  <VcMenuItem color="secondary" :active="isActive" :to="item.route" class="account-navigation-item">
    <template #prepend>
      <VcIcon size="sm" :name="item.icon" />
    </template>

    {{ formatTextFunction(item?.title) }}
  </VcMenuItem>

  <slot />
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useLink } from "vue-router";
import type { ExtendedMenuLinkType } from "@/core/types";

const props = withDefaults(defineProps<IProps>(), {
  formatTextFunction: (text: string | undefined) => text ?? "",
});

const item = toRef(props, "item");

const { isActive } = useLink({ to: item.value?.route ?? {} });

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
