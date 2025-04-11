<template>
  <div class="vc-product-button">
    <slot name="button">
      <VcButton
        class="vc-product-button__button"
        :to="to"
        :target="target"
        :variant="variant"
        :color="color"
        :prepend-icon="icon"
        :size="size"
        full-width
        :no-wrap="noWrap"
        :loading="loading"
        :truncate="truncate"
        :title="title"
        @click="$emit('linkClick', $event)"
      >
        {{ buttonText }}
      </VcButton>
    </slot>

    <slot>
      <component
        :is="linkTo ? 'router-link' : 'div'"
        v-if="linkText"
        :to="linkTo ?? null"
        target="_blank"
        :class="[
          'vc-product-button__link',
          {
            'vc-product-button__link--text': !linkTo,
          },
        ]"
      >
        <VcIcon class="vc-product-button__icon" :name="linkIcon" />

        <span class="vc-product-button__text">
          {{ linkText }}
        </span>
      </component>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "linkClick", globalEvent: MouseEvent): void;
}

interface IProps {
  to?: RouteLocationRaw;
  linkText?: string;
  linkIcon?: string;
  linkTo?: RouteLocationRaw;
  buttonText?: string;
  target?: BrowserTargetType;
  variant?: string;
  color?: string;
  icon?: string;
  noWrap?: boolean;
  loading?: boolean;
  truncate?: boolean;
  title?: string;
  size?: "sm" | "md";
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  to: "",
  linkTo: "",
  variant: "outline",
  color: "primary",
  size: "sm",
  linkIcon: "external-link",
});
</script>

<style lang="scss">
.vc-product-button {
  $self: &;
  $link: &;

  --link-icon-color: var(--vc-product-button-link-icon-color, theme("colors.primary.500"));
  --link-color: var(--vc-product-button-link-color, theme("colors.accent.600"));
  --link-hover-color: var(--vc-product-button-link-hover-color, theme("colors.accent.800"));

  @apply flex flex-col;

  &__link {
    $link: &;

    --vc-icon-size: 1rem;
    --vc-icon-color: var(--link-icon-color);

    @apply mt-3 flex items-center min-h-4 gap-1 text-xs;

    @media (min-width: theme("screens.xs")) {
      @apply mt-5;
    }

    &:not(#{&}--text) {
      @apply text-[--link-color] font-bold;

      &:hover {
        @apply text-[--link-hover-color];
      }
    }
  }

  &__text {
    @apply truncate;
  }

  @at-root .vc-product-card {
    #{$self} {
      @apply mt-3;

      grid-area: add-to-cart;
    }

    &--view-mode {
      &--grid #{$self} {
        @apply order-7 min-h-[3.375rem];
      }

      &--list #{$self} {
        @container (min-width: theme("containers.sm")) {
          @apply w-72;
        }

        @container (min-width: theme("containers.xl")) {
          @apply mt-0 ms-3 w-44;
        }

        @container (min-width: theme("containers.4xl")) {
          @apply w-60;
        }
      }
    }
  }
}
</style>
