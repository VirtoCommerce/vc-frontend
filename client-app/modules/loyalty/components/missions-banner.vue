<template>
  <div class="missions-banner" :class="`missions-banner--${tone}`">
    <div class="missions-banner__icon">
      <VcIcon :name="icon" :size="24" />
    </div>

    <div class="missions-banner__body">
      <slot>
        <span v-if="title" class="missions-banner__title">{{ title }}</span>

        <p v-if="description" class="missions-banner__subtitle">{{ description }}</p>
      </slot>
    </div>

    <VcButton v-if="linkTo" :to="linkTo" :color="tone" variant="soft" size="sm" class="missions-banner__link">
      {{ linkText }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  variant: "light" | "dark";
  icon: string;
  title?: string;
  description?: string;
  linkTo?: RouteLocationRaw;
  linkText?: string;
}

const props = defineProps<IProps>();

// Both banners are white cards told apart by their accent: the balance in primary, the
// rewards in info.
const tone = computed(() => (props.variant === "dark" ? "info" : "primary"));
</script>

<style lang="scss">
.missions-banner {
  --accent: theme("colors.primary.500");

  @apply flex items-center gap-4 rounded-[--plate-radius,1.75rem] border-s-4 border-[--accent] bg-additional-50 p-5;

  box-shadow:
    2px 4px 10px -1px rgb(from theme("colors.additional.950") r g b / 0.08),
    0 0 3px rgb(from theme("colors.additional.950") r g b / 0.08);

  &--info {
    --accent: theme("colors.info.500");
  }

  &__icon {
    @apply flex size-14 shrink-0 items-center justify-center rounded-full bg-[--accent];

    --vc-icon-color: theme("colors.additional.50");
  }

  &__body {
    @apply flex min-w-0 flex-auto flex-col gap-1;
  }

  &__title {
    @apply text-sm font-extrabold uppercase leading-[18px] tracking-[0.02em] text-neutral-900;
  }

  &__subtitle {
    @apply text-[13px] leading-[18px] text-neutral-600;
  }

  &__link {
    @apply shrink-0;
  }
}
</style>
