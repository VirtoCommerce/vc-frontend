<template>
  <VcLineItems
    :items="preparedLineItems"
    :shared-selected-item-ids="sharedSelectedItemIds"
    :disabled="disabled"
    :readonly="readonly"
    with-image
    with-properties
    with-price
    with-total
    with-subtotal
    removable
    selectable
    @select:items="$emit('select:items', $event)"
    @remove:items="$emit('remove:items', $event)"
  >
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <VcQuantity
        :model-value="item.quantity"
        :name="item.id"
        :disabled="disabled"
        :readonly="readonly"
        :changing-timeout="0"
        @update:model-value="$emit('change:itemQuantity', { itemId: item.id, quantity: $event })"
      />

      <div v-if="item.availabilityData?.isInStock" class="mt-0.5 text-center">
        <InStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :quantity="item.availabilityData?.availableQuantity"
          :is-digital="item.productType === ProductType.Digital"
        />
      </div>
    </template>

    <template #after-content="{ item }">
      <div v-if="idErrors[item.id]" class="flex flex-col gap-1">
        <VcAlert
          v-for="(validationError, index) in idErrors[item.id]"
          :key="index"
          color="danger"
          size="sm"
          variant="outline-dark"
          icon
        >
          {{ validationError.translation }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useErrorsTranslator } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { prepareLineItems } from "@/core/utilities";
import { InStock } from "@/shared/catalog";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { ErrorType } from "@/core/composables";
import type { NamedValue } from "vue-i18n";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  items?: LineItemType[];
  validationErrors?: ValidationErrorType[];
  sharedSelectedItemIds?: string[];
}

interface IEmits {
  (event: "change:itemQuantity", value: { itemId: string; quantity: number }): void;
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
});

const validationErrors = computed<ErrorType[]>(() => {
  return props.validationErrors.map((el) => {
    return {
      id: el.objectId,
      code: el.errorCode,
      parameters: el.errorParameters?.reduce((acc, err) => {
        acc[err.key] = err.value;
        return acc;
      }, {} as NamedValue),
      description: el.errorMessage,
    };
  });
});

const { idErrors } = useErrorsTranslator("validation_error", validationErrors);

const preparedLineItems = computed(() => prepareLineItems(props.items));
</script>
