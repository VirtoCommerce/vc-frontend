<template>
  <VcLineItems
    :items="preparedLineItems"
    :selected-items="selectedItems"
    :disabled="disabled"
    :readonly="readonly"
    removable
    selectable
    @select:item="handleSelectItem"
    @select:all-items="handleSelectAllItems"
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

        <VcInStock
          :quantity="item.inStockQuantity"
          :is-digital="item.productType === ProductType.Digital"
          is-in-stock
        />
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <VcAlert
        v-for="(validationError, index) in validationErrorsByItemId[item.id]"
        :key="index"
        color="danger"
        icon
        variant="outline"
      >
        {{ validationError.errorMessage }}
      </VcAlert>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import _ from "lodash";
import { computed, ref } from "vue";
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

const selectedItems = ref<string[]>([]);
const preparedLineItems = computed(() => prepareLineItems(props.items));

const getValidationErrorTranslation = useCartValidationErrorTranslator();

function handleSelectItem(value: { id: string; selected: boolean }) {
  if (value.selected && !selectedItems.value.includes(value.id)) {
    selectedItems.value.push(value.id);
  } else if (!value.selected) {
    _.pull(selectedItems.value, value.id);
  }

  console.log("handleSelectItem", value.id, value.selected, selectedItems.value);
}

function handleSelectAllItems(selectAll: boolean) {
  selectedItems.value = [];

  if (selectAll) {
    selectedItems.value = _.map(props.items, "id");
  }

  console.log("handleSelectAllItems", selectedItems.value);
}

const validationErrorsByItemId = computed<Record<string, ValidationErrorType[]>>(() => {
  const result: Record<string, ValidationErrorType[]> = props.validationErrors.reduce((records, item) => {
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
  }, {} as Record<string, ValidationErrorType[]>);

  return result;
});
</script>
