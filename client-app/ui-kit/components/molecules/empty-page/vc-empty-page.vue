<template>
  <VcContainer
    :class="[
      'vc-empty-page',
      {
        'vc-empty-page--hide-mobile-side': hideMobileSide,
      },
    ]"
    :bg-color="bgColor"
    :has-bg-image="hasBgImage"
  >
    <div class="vc-empty-page__wrapper">
      <VcBreadcrumbs v-if="breadcrumbs?.length" :items="breadcrumbs" class="vc-empty-page__breadcrumbs" />

      <div class="vc-empty-page__title">
        <slot name="title">
          <VcTypography v-if="title" tag="h1">
            {{ title }}
          </VcTypography>
        </slot>
      </div>

      <div class="vc-empty-page__main">
        <div class="vc-empty-page__content">
          <slot />
        </div>

        <div class="vc-empty-page__side">
          <slot name="side">
            <VcCompositeShape :icon="icon" :img="image" :icon-bg-color="statusColor" />
          </slot>
        </div>
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
export interface IProps {
  title?: string;
  image?: string;
  icon?: string;
  statusColor?: string;
  breadcrumbs?: IBreadcrumb[];
  hideMobileSide?: boolean;
  bgColor?: string;
  hasBgImage?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-empty-page {
  $hideMobileSide: "";

  --vc-composite-shape-size: 15rem;

  @media (min-width: theme("screens.lg")) {
    --vc-composite-shape-size: 27.5rem;
  }

  &--hide-mobile-side {
    $hideMobileSide: &;
  }

  &__wrapper {
    @apply py-7;

    @media (min-width: theme("screens.lg")) {
      @apply pt-0 pb-24;
    }
  }

  &__breadcrumbs {
    @apply hidden;

    @media (min-width: theme("screens.sm")) {
      @apply block mb-3;
    }
  }

  &__title {
    @apply mb-7 text-center;

    @media (max-width: theme("screens.lg")) {
      @apply empty:hidden;
    }

    @media (min-width: theme("screens.sm")) {
      @apply text-start;
    }

    @media (min-width: theme("screens.lg")) {
      @apply empty:pt-4;
    }
  }

  &__main {
    @apply flex flex-col items-center text-center;

    @media (min-width: theme("screens.sm")) {
      @apply flex-row items-stretch mx-auto max-w-[68.75rem] text-start;
    }
  }

  &__content {
    @apply contents;

    @media (min-width: theme("screens.sm")) {
      @apply flex flex-col justify-center items-start grow;
    }
  }

  &__side {
    @apply order-first flex w-full justify-center mb-7;

    @media (min-width: theme("screens.sm")) {
      @apply order-last w-auto;
    }

    #{$hideMobileSide} & {
      @media (max-width: theme("screens.sm")) {
        @apply hidden;
      }
    }
  }
}
</style>
