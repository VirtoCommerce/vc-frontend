<template>
  <div class="account-navigation-item" :class="{ 'account-navigation-item--active': isActive }">
    <component :is="item?.route ? 'router-link' : 'a'" :to="item?.route" class="account-navigation-item__link">
      <VcIcon size="sm" class="account-navigation-item__icon" :name="item?.icon" />
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

  --color: var(--color-neutral-500);

  &--active {
    $active: &;
  }

  &:hover {
    $hover: &;
  }

  &__link {
    @apply flex items-center p-2.5;

    #{$active} & {
      @apply bg-neutral-100;
    }
  }

  &__icon {
    @apply mr-2.5 flex-none;

    #{$active} &,
    #{$hover} & {
      --color: var(--color-primary-500);
    }
  }

  &__text {
    @apply overflow-hidden text-ellipsis text-sm font-bold text-neutral;

    #{$active} & {
      @apply text-neutral-900;
    }

    #{$hover} & {
      @apply text-neutral-600;
    }
  }
}
</style>
