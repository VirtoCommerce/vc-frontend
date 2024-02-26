<template>
  <VcLineItems :items="preparedLineItems" subtotal item-total>
    <template #titles>
      <div class="min-w-[5.5rem] text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex flex-col items-center gap-1.5">
        <VcQuantity
          :model-value="item.quantity"
          :name="item.id"
          :min-quantity="item.minQuantity"
          :max-quantity="item.maxQuantity"
          disabled
        />
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { prepareLineItems } from "@/core/utilities";
import type { LineItemType, OrderLineItemType } from "@/core/api/graphql/types";

interface IProps {
  items?: OrderLineItemType[] | LineItemType[];
}

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const preparedLineItems = computed(() => prepareLineItems(props.items));
</script>

<style scoped lang="scss">
.vc-order-line-items {
  &__header {
    @media (min-width: theme("screens.md")) {
      grid-template-columns: 250px 1fr 100px;
      grid-template-areas: "product properties total";
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-columns: 250px 1fr 120px 88px 100px;
      grid-template-areas: "product properties price quantity total";
    }
  }

  &__line-item {
    grid-template-areas:
      "img name name"
      "img props props"
      "img quantity total";
    grid-template-columns: 64px auto 1fr;

    @media (min-width: theme("screens.md")) {
      grid-template-areas:
        "product props quantity"
        "product props total";
      grid-template-columns: 250px 1fr 100px;
    }

    @media (min-width: theme("screens.xl")) {
      grid-template-areas: "product properties price quantity total";
      grid-template-columns: 250px 1fr 120px 88px 100px;
    }
  }

  &__product {
    grid-area: product;
  }

  &__img {
    grid-area: img;
  }

  &__name {
    grid-area: name;
  }

  &__props {
    grid-area: props;
  }

  &__properties {
    grid-area: properties;
  }

  &__total {
    grid-area: total;
  }

  &__quantity {
    grid-area: quantity;
  }

  &__price {
    grid-area: price;
  }
}
</style>
