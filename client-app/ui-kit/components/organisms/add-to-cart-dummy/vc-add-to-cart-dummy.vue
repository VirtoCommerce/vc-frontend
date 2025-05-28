<template>
  <div class="vc-add-to-cart" :class="{ 'vc-add-to-cart--hide-button': hideButton }">
    <VcInput
      v-model.number="quantity"
      :name="name"
      type="number"
      :aria-label="$t('ui_kit.labels.product_quantity')"
      :disabled="disabled"
      :max="maxQuantity"
      :min="minQuantity"
      :size="size"
      single-line-message
      center
      :error="!isValid || error"
      :message="message"
      :show-empty-details="showEmptyDetails"
      :readonly="readonly"
      @blur="$emit('blur')"
    >
      <template #append>
        <template v-if="!hideButton">
          <VcButton
            class="vc-add-to-cart__icon-button"
            :variant="buttonVariant"
            :loading="loading"
            :disabled="disabled"
            :title="buttonText ?? $t('ui_kit.buttons.add_to_cart')"
            :icon="buttonIcon"
            @click.stop="$emit('update:cartItemQuantity')"
          />

          <VcButton
            class="vc-add-to-cart__text-button"
            :variant="buttonVariant"
            :loading="loading"
            :disabled="disabled"
            :title="buttonText"
            truncate
            @click.stop="$emit('update:cartItemQuantity')"
          >
            {{ buttonText }}
          </VcButton>
        </template>

        <slot name="append" />
      </template>
    </VcInput>

    <div v-if="$slots.default" class="vc-add-to-cart__badges">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  name?: string;
  modelValue?: number;
  loading?: boolean;
  disabled?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  message?: string;
  showEmptyDetails?: boolean;
  error?: boolean;
  hideButton?: boolean;
  readonly?: boolean;
  isValid?: boolean;
  size?: "sm" | "md";
  buttonIcon?: "refresh" | "cart";
  buttonVariant?: "outline" | "solid";
  buttonText?: string;
}

interface IEmits {
  (event: "update:cartItemQuantity"): void;
  (event: "blur"): void;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  validateOnMount: true,
  size: "sm",
  buttonIcon: "cart",
  buttonVariant: "solid",
});

const quantity = defineModel<number>({ default: 0 });
</script>

<style lang="scss">
.vc-add-to-cart {
  $self: &;
  $hideButton: &;

  @apply @container flex-none;

  &--hide-button {
    $hideButton: &;
  }

  &__icon-button.vc-button {
    @container (width > theme("containers.xxs")) {
      @apply hidden;
    }
  }

  &__text-button.vc-button {
    @apply hidden;

    @container (width > theme("containers.xxs")) {
      @apply block;
    }
  }

  &__badges {
    @apply mt-2 flex flex-wrap gap-x-1.5 gap-y-0.5 empty:hidden;
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: add-to-cart;
    }

    &--view-mode {
      &--grid {
        #{$self} {
          @apply mt-3 order-7;
        }
      }

      &--list {
        #{$self} {
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

      &--item {
        #{$hideButton} {
          @apply mt-3 w-[5rem] self-start;

          @container (min-width: theme("containers.xl")) {
            @apply w-[6.75rem] self-center;
          }

          @container (min-width: theme("containers.2xl")) {
            @apply mt-0 ms-3 w-[5.5rem];
          }
        }
      }
    }
  }
}
</style>
