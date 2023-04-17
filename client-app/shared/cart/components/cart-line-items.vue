<template>
  <VcLineItems
    :items="items"
    :disabled="disabled"
    :readonly="readonly"
    removable
    @remove:item="$emit('remove:item', $event)"
  >
    <template #titles>
      <div class="min-w-[5.5rem] text-center">
        {{ $t("common.labels.quantity") }}
      </div>

      <div class="text-right">
        {{ $t("common.labels.total") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex flex-col items-center gap-1.5">
        <VcQuantity
          :model-value="item.quantity"
          :name="item.id"
          :min-quantity="item.minQuantity"
          :max-quantity="item.maxQuantity"
          :disabled="disabled"
          :readonly="readonly"
          @update:model-value="$emit('change:itemQuantity', { item, quantity: $event })"
        />

        <VcInStock :quantity="item.inStockQuantity" is-in-stock />
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <VcAlert v-for="(validationError, index) in validationErrorsByItemId[item.id]" :key="index" type="danger" icon>
        {{ validationError.errorMessage }}
      </VcAlert>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCartValidationErrorTranslator } from "@/core/composables";
import type { LineItemType, ValidationErrorType } from "@/xapi/types";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  items?: LineItemType[];
  /** @deprecated */
  validationErrors?: ValidationErrorType[];
}

interface IEmits {
  (event: "change:itemQuantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:item", value: LineItemType): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
});

const getValidationErrorTranslation = useCartValidationErrorTranslator();

const validationErrorsByItemId = computed<Record<string, ValidationErrorType[]>>(() => {
  const result: Record<string, ValidationErrorType[]> = props.validationErrors.reduce((records, item) => {
    if (item.objectId) {
      records[item.objectId]
        ? records[item.objectId].push({ ...item, errorMessage: getValidationErrorTranslation(item) })
        : (records[item.objectId] = [{ ...item, errorMessage: getValidationErrorTranslation(item) }]);
    }

    return records;
  }, {} as Record<string, ValidationErrorType[]>);

  return result;
});
</script>
