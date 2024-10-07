<template>
  <div class="account-navigation-link" :class="{ 'account-navigation-link--active': isActive }">
    <component :is="item?.route ? 'router-link' : 'a'" :to="item?.route" class="account-navigation-link__link">
      <VcIcon size="sm" class="account-navigation-link__icon" :name="item?.icon" />
      <span class="account-navigation-link__text">{{ item?.title }}</span>
    </component>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useLink } from "vue-router";
import type { ExtendedMenuLinkType } from "@/core/types";

const props = defineProps<IProps>();

const item = toRef(props, "item");

const { isActive } = useLink({ to: item.value?.route ?? {} });

interface IProps {
  item: ExtendedMenuLinkType;
}
</script>

<style lang="scss">
.account-navigation-link {
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
