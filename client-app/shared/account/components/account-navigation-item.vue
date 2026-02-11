<template>
  <div class="account-navigation-item" :class="{ 'account-navigation-item--active': isActive }">
    <component :is="item?.route ? 'router-link' : 'a'" :to="item?.route" class="account-navigation-item__link">
      <VcIcon size="sm" class="account-navigation-item__icon fill-primary" :name="item?.icon" />

      <span class="account-navigation-item__text">{{ formatTextFunction(item?.title) }}</span>
    </component>

    <slot />
  </div>
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
  $active: "";
  $hover: "";

  &--active {
    $active: &;
  }

  &:hover {
    $hover: &;
  }

  &__link {
    @apply flex items-center p-2.5 rounded-md;

    #{$active} & {
      @apply bg-secondary-100;
    }

    #{$hover}:not(#{$active}) & {
      @apply bg-secondary-50;
    }
  }

  &__icon {
    @apply mr-2.5 flex-none;
  }

  &__text {
    @apply overflow-hidden text-ellipsis text-sm;

    #{$active} & {
      @apply font-bold;
    }
  }
}
</style>
