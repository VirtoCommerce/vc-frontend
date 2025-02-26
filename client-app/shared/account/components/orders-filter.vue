<template>
  <div class="w-[27.5rem]">
    <VcDialog dividers>
      <VcDialogHeader @close="$emit('close')">
        {{ $t("shared.account.orders_filter.title") }}
      </VcDialogHeader>

      <VcDialogContent>
        <VcLabel>{{ $t("shared.account.orders_filter.created_date_label") }}</VcLabel>

        <div class="mb-5 flex flex-col space-y-5">
          <slot name="dateFilterType" />
        </div>

        <div class="my-4">
          <slot name="buyerNameFilterType" />
        </div>

        <div v-if="!!facets">
          <VcLabel>{{ $t("shared.account.orders_filter.status_label") }}</VcLabel>

          <VcCheckboxGroup v-model="filterData.statuses" class="mt-2 space-y-3.5">
            <VcCheckbox
              v-for="facet in statusFacet?.items"
              :key="facet.term"
              :value="facet.term"
              :class="{ 'font-bold': isSelectedStatus(facet.term), 'text-neutral': !isSelectedStatus(facet.term) }"
            >
              <div class="flex w-full max-w-full gap-1">
                <div class="min-w-0 truncate">{{ facet.label }}</div>
                <VcBadge variant="outline" rounded>{{ facet.count }}</VcBadge>
              </div>
            </VcCheckbox>
          </VcCheckboxGroup>
        </div>
      </VcDialogContent>

      <VcDialogFooter>
        <VcButton
          color="secondary"
          variant="outline"
          :disabled="isFilterEmpty && !isFilterDirty"
          size="sm"
          @click="$emit('reset')"
        >
          {{ $t("shared.account.orders_filter.reset_button") }}
        </VcButton>

        <VcButton size="sm" :disabled="!isFilterDirty" @click="$emit('apply')">
          {{ $t("shared.account.orders_filter.apply_button") }}
        </VcButton>
      </VcDialogFooter>
    </VcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { useUserOrders, useUserOrdersFilter } from "../composables";

interface IEmits {
  (event: "apply"): void;
  (event: "reset"): void;
  (event: "close"): void;
}

defineEmits<IEmits>();

const { facets } = useUserOrders({});
const { filterData, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

const statusFacet = computed(() => facets.value?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME));

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
