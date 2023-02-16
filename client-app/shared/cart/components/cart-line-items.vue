<template>
  <div class="vc-cart-line-items">
    <!-- table header -->
    <div class="vc-cart-line-items__header gap-x-3 px-4 py-3 border rounded-t text-sm font-bold hidden md:grid">
      <div class="vc-cart-line-items__product">
        {{ $t("common.labels.product") }}
      </div>
      <div class="vc-cart-line-items__properties">
        {{ $t("common.labels.properties") }}
      </div>
      <div class="vc-cart-line-items__price hidden xl:block pr-4 text-right">
        {{ $t("common.labels.price_per_item") }}
      </div>
      <div class="vc-cart-line-items__quantity hidden xl:block text-right">
        {{ $t("common.labels.quantity") }}
      </div>
      <div class="vc-cart-line-items__total text-right">
        {{ $t("common.labels.total") }}
      </div>
      <div class="vc-quote-line-items__remove-button w-8"></div>
    </div>

    <!-- table body -->
    <div v-if="items.length" class="flex flex-col gap-[1.875rem] md:gap-0 md:border-x md:divide-y">
      <CartLineItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :readonly="readonly"
        :disabled="disabled"
        class="relative border rounded shadow-t-3sm md:rounded-none md:shadow-none md:border-0"
        @change:quantity="$emit('change:item:quantity', { item, quantity: $event })"
        @remove="$emit('remove:item', item)"
      >
        <template #before>
          <!-- Line item validation error -->
          <VcAlert
            v-for="(validationError, index) in validationErrorsByItemId[item.id]"
            :key="index"
            type="danger"
            class="-mt-0.5 mb-3 mx-3 md:-mt-2 md:mb-2.5 md:mx-4"
            icon
          >
            {{ validationError.errorMessage }}
          </VcAlert>
        </template>
      </CartLineItem>
    </div>

    <!-- table footer -->
    <div
      class="flex items-center justify-end py-2.5 gap-2 text-[color:var(--color-price)] md:px-4 md:py-2.5 md:border md:rounded-b"
    >
      <span class="text-13 font-bold">{{ $t("common.labels.subtotal") }}:</span>
      <span class="text-17 font-extrabold">{{ $n(subtotal, "currency") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { groupBy, sumBy } from "lodash";
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
