<template>
  <div class="account-navigation-link" :class="{ 'account-navigation-link--active': isActive }">
    <router-link :to="to" class="account-navigation-link__link">
      <VcIcon size="sm" class="account-navigation-link__icon" :name="icon" />
      <span class="account-navigation-link__text">{{ text }}</span>
    </router-link>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useLink } from "vue-router";
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(defineProps<IProps>(), {
  text: "",
  to: "/",
  icon: "",
});

const { isActive } = useLink({ to: props.to });

interface IProps {
  text?: string;
  to?: RouteLocationRaw;
  icon?: string;
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
