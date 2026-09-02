<template>
  <div class="missions-banner" :class="`missions-banner--${variant}`">
    <div class="missions-banner__icon" :class="`missions-banner__icon--${variant}`">
      <VcIcon :name="icon" variant="solid" class="text-primary" :size="28" />
    </div>

    <div class="missions-banner__body">
      <slot>
        <span v-if="title" class="missions-banner__title">{{ title }}</span>

        <p v-if="description" class="missions-banner__subtitle">{{ description }}</p>
      </slot>
    </div>

    <slot name="link" />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  variant: "light" | "dark";
  icon: string;
  title?: string;
  description?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.missions-banner {
  @apply flex items-center gap-4 rounded-[--vc-radius] border p-5 shadow-sm;

  &--light {
    @apply border-neutral-200 bg-additional-50;
  }

  &--dark {
    @apply border-transparent bg-additional-950;
  }

  &__icon {
    @apply flex size-14 shrink-0 items-center justify-center rounded-full;

    &--light {
      @apply bg-primary-50;
    }

    &--dark {
      @apply bg-additional-50/10;
    }
  }

  &__body {
    @apply flex min-w-0 flex-col;
  }

  &__title {
    @apply font-bold text-additional-50;
  }

  &__subtitle {
    @apply text-sm text-neutral-400;
  }

  &__link {
    @apply ms-auto flex shrink-0 items-center gap-1 text-sm font-bold;

    &--default {
      @apply text-[--link-color] hover:text-[--link-hover-color];
    }

    &--accent {
      @apply text-primary hover:text-primary-600;
    }
  }
}
</style>
