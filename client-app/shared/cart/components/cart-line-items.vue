<template>
  <VcLineItems
    :items="preparedLineItems"
    :shared-selected-item-ids="sharedSelectedItemIds"
    :disabled="disabled"
    :readonly="readonly"
    :browser-target="$cfg.details_browser_target"
    with-image
    with-properties
    with-price
    with-total
    with-subtotal
    removable
    saveable-for-later
    :selectable="selectable"
    @select:items="$emit('select:items', $event)"
    @remove:items="$emit('remove:items', $event)"
    @save-for-later="$emit('saveForLater', $event)"
    @link-click="handleLinkClick($event)">
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <QuantityControl
        :mode="$cfg.product_quantity_control"
        :min-quantity="item.minQuantity"
        :max-quantity="item.maxQuantity"
        :pack-size="item.packSize"
        :count-in-cart="item.countInCart"
        :available-quantity="item.availabilityData?.availableQuantity"
        hide-button
        :model-value="item.quantity"
        :name="item.id"
        :disabled="disabled"
        :readonly="readonly"
        disable-validation
        @update:model-value="$emit('change:itemQuantity', { itemId: item.id, quantity: $event })" />

      <div v-if="item.availabilityData?.isInStock" class="mt-2 text-center">
        <InStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :quantity="item.availabilityData?.availableQuantity"
          :is-digital="item.productType === ProductType.Digital" />
      </div>
    </template>

    <template #after-content="{ item }">
      <ConfigurationItems
        v-if="item.isConfigurable"
        :configuration-items="item.configurationItems"
        :line-item-id="item.id"
        allow-edit
        :route="item.route" />

      <div v-if="localizedItemsErrors[item.id]" class="flex flex-col gap-1">
        <VcAlert
          v-for="(validationError, index) in localizedItemsErrors[item.id]"
          :key="index"
          color="danger"
          size="sm"
          variant="outline-dark"
          icon>
          {{ validationError }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed, toRef, watchEffect } from "vue";
import { useErrorsTranslator } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { prepareLineItems } from "@/core/utilities";
import { InStock } from "@/shared/catalog";
import { ConfigurationItems } from "@/shared/common";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  items?: LineItemType[];
  validationErrors?: ValidationErrorType[];
  selectable?: boolean;
  sharedSelectedItemIds?: string[];
}

interface IEmits {
  (event: "change:itemQuantity", value: { itemId: string; quantity: number }): void;
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
  (event: "linkClick", value: LineItemType | undefined): void;
  (event: "saveForLater", value: string[]): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
  selectable: true,
});

const validationErrors = toRef(props, "validationErrors");

const { localizedItemsErrors, setErrors } = useErrorsTranslator<ValidationErrorType>("validation_error");

const preparedLineItems = computed(() => prepareLineItems(props.items));

watchEffect(() => setErrors(validationErrors.value));

const handleLinkClick = (item: PreparedLineItemType) => {
  const lineItem = props.items.find((cartLineItem) => cartLineItem.id === item.id);
  emit("linkClick", lineItem);
};
</script>
