<template>
  <div class="vc-cart-line-items">
    <!-- table header -->
    <div class="vc-cart-line-items__header hidden gap-x-3 rounded-t border px-4 py-3 text-sm font-bold md:grid">
      <div class="vc-cart-line-items__product">
        {{ $t("common.labels.product") }}
      </div>
      <div class="vc-cart-line-items__properties">
        {{ $t("common.labels.properties") }}
      </div>
      <div class="vc-cart-line-items__price hidden pr-4 text-right xl:block">
        {{ $t("common.labels.price_per_item") }}
      </div>
      <div class="vc-cart-line-items__quantity hidden text-right xl:block">
        {{ $t("common.labels.quantity") }}
      </div>
      <div class="vc-cart-line-items__total text-right">
        {{ $t("common.labels.total") }}
      </div>
      <div class="vc-quote-line-items__remove-button w-8"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="flex flex-col gap-[1.875rem] md:gap-0 md:divide-y md:border-x">
      <CartLineItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :readonly="readonly"
        :disabled="disabled"
        class="relative rounded border shadow-t-3sm md:rounded-none md:border-0 md:shadow-none"
        @change:quantity="$emit('change:item:quantity', { item, quantity: $event })"
        @remove="$emit('remove:item', item)"
      >
        <template #before>
          <!-- Line item validation error -->
          <VcAlert
            v-for="(validationError, index) in validationErrorsByItemId[item.id]"
            :key="index"
            type="danger"
            class="mx-3 -mt-0.5 mb-3 md:mx-4 md:-mt-2 md:mb-2.5"
            icon
          >
            {{ validationError.errorMessage }}
          </VcAlert>
        </template>
      </CartLineItem>
    </div>

    <!-- table footer -->
    <div
      class="flex items-center justify-end gap-2 py-2.5 text-[color:var(--color-price)] md:rounded-b md:border md:px-4 md:py-2.5"
    >
      <span class="text-13 font-bold">{{ $t("common.labels.subtotal") }}:</span>
      <span class="text-17 font-extrabold">{{ $n(subtotal, "currency") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { groupBy, sumBy } from "lodash";
import { computed } from "vue";
import { LineItemType, ValidationErrorType } from "@/xapi";
import CartLineItem from "./cart-line-item.vue";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  items: LineItemType[];
  /** @deprecated */
  validationErrors: ValidationErrorType[];
}

interface IEmits {
  (event: "change:item:quantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:item", value: LineItemType): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
});

const subtotal = computed<number>(() => sumBy(props.items, (item: LineItemType) => item.extendedPrice?.amount));

const validationErrorsByItemId = computed<Record<string, ValidationErrorType[]>>(() =>
  groupBy(props.validationErrors, (error: ValidationErrorType) => error.objectId)
);
</script>

<style scoped lang="scss">
.vc-cart-line-items {
  &__header {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 250px 1fr 100px min-content;
      grid-template-areas: "product properties total remove-button";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 88px 100px min-content;
      grid-template-areas: "product properties price quantity total remove-button";
    }
  }
}
</style>
