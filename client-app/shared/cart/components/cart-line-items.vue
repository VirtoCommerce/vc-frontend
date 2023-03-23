<template>
  <VcLineItems
    :items="items"
    :disabled="disabled"
    :readonly="readonly"
    removable
    @remove:item="emit('remove:item', $event)"
  >
    <template #titles>
      <div class="min-w-[5.5rem] text-center">
        {{ $t("common.labels.quantity") }}
      </div>

      <div>
        {{ $t("common.labels.total") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex flex-col items-center gap-1.5">
        <VcQuantity
          :disabled="disabled"
          :readonly="readonly"
          :item="item"
          @change="$emit('change:itemQuantity', { item, quantity: $event })"
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
import { groupBy } from "lodash";
import { computed } from "vue";
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

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
  validationErrors: () => [],
});

const validationErrorsByItemId = computed<Record<string, ValidationErrorType[]>>(() =>
  groupBy(props.validationErrors, (error: ValidationErrorType) => error.objectId)
);
</script>
