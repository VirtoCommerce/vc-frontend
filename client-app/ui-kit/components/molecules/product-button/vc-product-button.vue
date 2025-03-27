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
      <router-link v-if="linkText" :to="to" target="_blank" class="vc-product-button__link">
        <VcIcon class="vc-product-button__icon" name="external-link" />

        <span class="vc-product-button__text">
          {{ linkText }}
        </span>
      </router-link>
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
  variant: "outline",
  color: "primary",
  size: "sm",
});
</script>

<style lang="scss">
.vc-product-button {
  $self: &;

  @apply flex flex-col;

  &__link {
    --vc-icon-size: 1rem;
    --vc-icon-color: theme("colors.primary.500");

    @apply flex items-center gap-1 text-xs text-[--link-color] hover:text-[--link-hover-color] mt-3.5;

    @container (min-width: theme("containers.xl")) {
      @apply mt-7;
    }
  }

  &__text {
    @apply truncate;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: add-to-cart;
    }

    &--view-mode {
      &--grid #{$self} {
        @apply mt-3;

        @container (min-width: theme("containers.xs")) {
          @apply mt-4;
        }
      }

      &--list #{$self} {
        @apply mt-3;

        @container (min-width: theme("containers.sm")) {
          @apply w-72;
        }

        @container (min-width: theme("containers.xl")) {
          @apply mt-0 ms-3 w-44;
        }

        @container (min-width: theme("containers.4xl")) {
          @apply mt-0 ms-3 w-60;
        }
      }
    }
  }
}
</style>
