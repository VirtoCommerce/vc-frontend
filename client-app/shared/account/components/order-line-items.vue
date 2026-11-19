<template>
  <VcLineItems
    :items="preparedLineItems"
    :browser-target="browserTarget"
    with-image
    with-properties
    with-price
    with-total
    with-subtotal
    :subtotal-currency-code="subtotalCurrencyCode"
  >
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <VcAddToCart
        hide-button
        :model-value="item.quantity"
        :name="item.id"
        :min-quantity="item.minQuantity"
        :max-quantity="item.maxQuantity"
        disabled
      />
    </template>

    <template #after-content="{ item }">
      <ExtensionPointList
        v-if="orderId"
        category="orderLineItem"
        :names="[EXTENSION_NAMES.orderLineItem.details]"
        :condition-params="item"
        :line-item="item"
        :order-id="orderId"
      />

      <ConfigurationItems v-if="item.configurationItems?.length" :configuration-items="item.configurationItems" />
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBrowserTarget } from "@/core/composables";
import { prepareLineItems } from "@/core/utilities";
import { ConfigurationItems } from "@/shared/common";
import { EXTENSION_NAMES } from "@/shared/common/constants";
import type { LineItemType, OrderLineItemType } from "@/core/api/graphql/types";

interface IProps {
  items?: OrderLineItemType[] | LineItemType[];
  subtotalCurrencyCode?: string;
  /** A placed order's id: its lines then show what modules add to them (`orderLineItem`); not set for a cart. */
  orderId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const { browserTarget } = useBrowserTarget();

const preparedLineItems = computed(() => prepareLineItems(props.items));
</script>
