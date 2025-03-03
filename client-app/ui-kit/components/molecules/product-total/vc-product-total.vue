<template>
  <div class="vc-product-total">
    <div class="vc-product-total__label">
      {{ $t("ui_kit.labels.total") }}
    </div>

    <VcProductPrice
      :actual-price="actualPrice"
      :list-price="listPrice"
      align="end"
      :with-from-label="hasVariations"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  actualPrice?: MoneyType;
  listPrice?: MoneyType;
  hasVariations?: boolean;
  disabled?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-product-total {
  $self: &;

  &__label {
    @apply text-sm font-bold text-end;

    word-break: break-word;

    @container (min-width: theme("containers.2xl")) {
      @apply hidden;
    }
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: total;
    }

    &--view-mode {
      &--grid #{$self} {
        @apply hidden;
      }

      &--list #{$self} {
        @apply hidden;
      }

      &--item #{$self} {
        --vc-product-price-font-size: theme("fontSize.base");

        @apply mt-1 flex-row items-center gap-x-1.5 flex-wrap;

        @container (min-width: theme("containers.2xl")) {
          @apply mt-0 ms-3 w-[7.5rem] justify-end;
        }
      }
    }
  }
}
</style>
