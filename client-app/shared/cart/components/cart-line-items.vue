<template>
  <VcLineItems
    :items="preparedLineItems"
    :shared-selected-item-ids="sharedSelectedItemIds"
    :disabled="disabled"
    :readonly="readonly"
    removable
    selectable
    @select:items="$emit('select:items', $event)"
    @remove:items="$emit('remove:items', $event)"
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

        <VcInStock
          :quantity="item.inStockQuantity"
          :is-digital="item.productType === ProductType.Digital"
          is-in-stock
        />
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <div class="grid gap-y-2">
        <VcAlert
          v-for="(validationError, index) in validationErrorsByItemId[item.id]"
          :key="index"
          color="danger"
          size="sm"
          variant="outline-dark"
          icon
        >
          {{ validationError.errorMessage }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCartValidationErrorTranslator } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { prepareLineItems } from "@/core/utilities";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";

interface IProps {
  disabled?: boolean;
  readonly?: boolean;
  items?: LineItemType[];
  /** @deprecated */
  validationErrors?: ValidationErrorType[];
  sharedSelectedItemIds?: string[];
}

interface IEmits {
  (event: "change:itemQuantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
});

const preparedLineItems = computed(() => prepareLineItems(props.items));

const getValidationErrorTranslation = useCartValidationErrorTranslator();

const validationErrorsByItemId = computed<Record<string, ValidationErrorType[]>>(() => {
  const errors: ValidationErrorType[] = [
    {
      objectId: "2638912b-c9f1-4beb-9e28-00ee63edfd0f",
      errorMessage: "Error 1",
    },
    {
      objectId: "2638912b-c9f1-4beb-9e28-00ee63edfd0f",
      errorMessage: "Error 2",
    },
  ];

  const result: Record<string, ValidationErrorType[]> = errors.reduce(
    (records, item) => {
      if (item.objectId) {
        const key = item.objectId;
        const editedItem = { ...item, errorMessage: getValidationErrorTranslation(item) };

        if (records[key]) {
          records[key].push(editedItem);
        } else {
          records[key] = [editedItem];
        }
      }

      return records;
    },
    {} as Record<string, ValidationErrorType[]>,
  );

  return result;
});
</script>
