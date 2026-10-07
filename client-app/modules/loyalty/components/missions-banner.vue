<template>
  <div class="missions-banner" :class="`missions-banner--color--${color}`">
    <div class="missions-banner__icon">
      <VcIcon :name="icon" :size="24" />
    </div>

    <div class="missions-banner__body">
      <span v-if="title" class="missions-banner__title">{{ title }}</span>

      <slot>
        <p v-if="description" class="missions-banner__subtitle">{{ description }}</p>
      </slot>
    </div>

    <VcButton v-if="linkTo" class="missions-banner__action" :to="linkTo" :color="color" variant="soft" size="sm">
      {{ linkText }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  color: "primary" | "info";
  icon: string;
  title?: string;
  description?: string;
  linkTo?: RouteLocationRaw;
  linkText?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.missions-banner {
  --accent-color: theme("colors.primary.500");

  @apply flex items-center gap-4 rounded-[--vc-radius] border-s-4 border-[--accent-color] bg-additional-50 p-5;

  box-shadow:
    2px 4px 10px -1px rgb(from theme("colors.additional.950") r g b / 0.08),
    0 0 3px rgb(from theme("colors.additional.950") r g b / 0.08);

  &--color--info {
    --accent-color: theme("colors.info.500");
  }

  &__icon {
    @apply flex size-14 shrink-0 items-center justify-center rounded-full bg-[--accent-color] text-additional-50;
  }

  &__body {
    @apply flex min-w-0 flex-col gap-1;
  }

  &__title {
    @apply text-sm font-extrabold uppercase tracking-wide text-neutral-900;
  }

  &__subtitle {
    @apply text-sm text-neutral-600;
  }

  &__action {
    @apply ms-auto shrink-0;
  }
}
</style>
