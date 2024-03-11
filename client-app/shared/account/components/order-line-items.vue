<template>
  <VcLineItems :items="preparedLineItems" with-image with-properties with-price with-total with-subtotal>
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <VcQuantity
        :model-value="item.quantity"
        :name="item.id"
        :min-quantity="item.minQuantity"
        :max-quantity="item.maxQuantity"
        disabled
      />
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
