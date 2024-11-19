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
      <VcAddToCart
        hide-button
        :model-value="item.quantity"
        :name="item.id"
        :disabled="disabled"
        :readonly="readonly"
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
      <div v-if="item.configurationItems?.length" class="rounded border bg-neutral-50 px-4 py-2">
        <button
          type="button"
          class="flex items-center gap-1 text-xs font-bold"
          @click="configurationItemsCollapseState[item.id] = !configurationItemsCollapseState[item.id]"
        >
          <span>{{ $t("shared.cart.configuration_items.title") }}</span>

          <VcIcon
            class="text-primary"
            :name="configurationItemsCollapseState[item.id] ? 'chevron-up' : 'chevron-down'"
            size="xs"
          />
        </button>

        <ul class="space-y-1.5 pt-2 text-xs" :class="{ hidden: !configurationItemsCollapseState[item.id] }">
          <li v-for="(configurationItem, index) in item.configurationItems" :key="configurationItem.id">
            {{ `${index + 1}. ${configurationItem.name}` }}
          </li>
        </ul>
      </div>

      <div v-if="localizedItemsErrors[item.id]" class="flex flex-col gap-1">
        <VcAlert
          v-for="(validationError, index) in localizedItemsErrors[item.id]"
          :key="index"
          color="danger"
          size="sm"
          variant="outline-dark"
          icon
        >
          {{ validationError }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watchEffect } from "vue";
import { useErrorsTranslator } from "@/core/composables";
import { ProductType } from "@/core/enums";
import { prepareLineItems } from "@/core/utilities";
import { InStock } from "@/shared/catalog";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";

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

const validationErrors = toRef(props, "validationErrors");
const configurationItemsCollapseState = ref<Record<string, boolean>>({});

const { localizedItemsErrors, setErrors } = useErrorsTranslator<ValidationErrorType>("validation_error");

const preparedLineItems = computed(() => prepareLineItems(props.items));

watchEffect(() => setErrors(validationErrors.value));
</script>
