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
          @update:model-value="$emit('change:itemQuantity', { itemId: item.id, quantity: $event })"
          @update:validation="setValidationStatus(item, $event)"
        />

        <InStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :quantity="item.availabilityData?.availableQuantity"
          :is-digital="item.productType === ProductType.Digital"
        />
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <div class="flex flex-col gap-1">
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
import { useLineItemsValidation } from "@/ui-kit";
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

const { validationErrors: maxLimitValidationErrors, setValidationStatus } = useLineItemsValidation();

const validationErrors = computed<ErrorType[]>(() => {
  let errors: ErrorType[] = props.validationErrors.map((error: ValidationErrorType) => {
    return {
      id: error.objectId,
      code: error.errorCode,
      parameters: error.errorParameters?.reduce((acc, err) => {
        acc[err.key] = err.value;
        return acc;
      }, {} as NamedValue),
      description: error.errorMessage,
    };
  });

  if (maxLimitValidationErrors.value.length) {
    errors = errors.concat(
      maxLimitValidationErrors.value.map((item) => ({
        id: item.objectId,
        code: item.errorCode,
        description: item.errorMessage,
      })),
    );
  }

  return errors;
});

const { idErrors } = useErrorsTranslator("validation_error", validationErrors);

const preparedLineItems = computed(() => prepareLineItems(props.items));
</script>
