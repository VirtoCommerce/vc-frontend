<template>
  <div class="vc-line-items">
    <!-- table header -->
    <div class="vc-line-items__head">
      <div class="vc-line-items__product">
        {{ $t("common.labels.product") }}
      </div>

      <div class="vc-line-items__properties">{{ $t("common.labels.properties") }}</div>

      <div class="vc-line-items__price">
        {{ $t("common.labels.price_per_item") }}
      </div>

      <div class="vc-line-items__slot">
        <slot name="titles" />
      </div>

      <div v-if="removable" class="vc-line-items__removable"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="vc-line-items__body">
      <VcLineItem
        v-for="item in items"
        :key="item.id"
        :image-url="item.imageUrl"
        :name="item.name"
        :route="item.route"
        :deleted="item.deleted"
        :properties="item.properties"
        :disabled="disabled"
        :list-price="$cfg.show_prices_with_taxes ? item.listPriceWithTax : item.listPrice"
        :actual-price="$cfg.show_prices_with_taxes ? item.actualPriceWithTax : item.actualPrice"
        :removable="removable"
        @remove="$emit('remove:item', item)"
      >
        <template #before>
          <slot name="before-content" v-bind="{ item }" />
        </template>

        <template #default>
          <slot v-bind="{ item }" />
        </template>

        <template #after>
          <slot name="after-content" v-bind="{ item }" />
        </template>
      </VcLineItem>
    </div>

    <!-- table footer -->
    <div v-if="!disableSubtotal" class="vc-line-items__foot">
      <div class="vc-line-items__subtotal">
        <span class="vc-line-items__subtotal-label">{{ $t("common.labels.subtotal") }}:</span>
        <span class="vc-line-items__subtotal-sum">{{ $n(subtotal, "currency") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import type { PreparedLineItemType } from "@/core/types";

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const { themeContext } = useThemeContext();

interface IEmits {
  (event: "remove:item", value: PreparedLineItemType): void;
}

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  removable?: boolean;
  items?: PreparedLineItemType[];
  disableSubtotal?: boolean;
}

const { show_prices_with_taxes } = themeContext.value.settings;

const subtotal = computed<number>(() =>
  sumBy(props.items, (item: PreparedLineItemType) =>
    show_prices_with_taxes ? item.extendedPriceWithTax?.amount : item.extendedPrice?.amount
  )
);
</script>

<style lang="scss">
.vc-line-items {
  @media (min-width: theme("screens.md")) {
    @apply border rounded divide-y;
  }

  &__head {
    @apply hidden;

    @media (min-width: theme("screens.md")) {
      @apply flex items-center gap-4 py-0.5 px-3 min-h-[2.75rem] text-sm font-bold;
    }

    @media (min-width: theme("screens.xl")) {
      @apply px-3;
    }
  }

  &__product {
    @apply flex-none w-[13.5rem];

    @media (min-width: theme("screens.2xl")) {
      @apply w-64;
    }
  }

  &__properties {
    @apply flex-grow;
  }

  &__price {
    @apply hidden;

    @media (min-width: theme("screens.2xl")) {
      @apply block w-[8.75rem] text-right;
    }
  }

  &__slot {
    @apply shrink-0 flex items-center justify-between w-[15.75rem];

    @media (min-width: theme("screens.md")) {
      @apply gap-4;
    }

    @media (min-width: theme("screens.lg")) {
      @apply w-1/3;
    }

    @media (min-width: theme("screens.xl")) {
      @apply w-[15.75rem];
    }
  }

  &__removable {
    @apply w-7;
  }

  &__body {
    @apply flex flex-col gap-5 md:gap-0 md:divide-y;

    @media (min-width: theme("screens.md")) {
      @apply space-y-0 divide-y;
    }
  }

  &__foot {
    @apply flex justify-end py-2.5;

    @media (min-width: theme("screens.md")) {
      @apply px-3;
    }
  }

  &__subtotal {
    @apply justify-self-end flex items-center gap-2 text-[color:var(--color-price)];
  }

  &__subtotal-label {
    @apply text-13 font-bold;
  }

  &__subtotal-sum {
    @apply text-17 font-extrabold;
  }
}
</style>
