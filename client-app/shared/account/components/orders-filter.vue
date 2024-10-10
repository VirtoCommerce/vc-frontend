<template>
  <div class="flex flex-col justify-between lg:justify-start">
    <div class="flex flex-col gap-4 space-y-8 lg:flex-row lg:space-y-0">
      <div v-if="!!facets" class="flex w-48 flex-col space-y-4">
        <div class="font-bold uppercase lg:normal-case lg:text-neutral-400">
          {{ $t("shared.account.orders_filter.status_label") }}
        </div>

        <VcCheckboxGroup v-model="filterData.statuses" class="space-y-4">
          <VcCheckbox
            v-for="facet in facets"
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

      <div class="flex w-48 flex-col space-y-3">
        <div class="font-bold uppercase lg:normal-case lg:text-neutral-400">
          {{ $t("shared.account.orders_filter.created_date_label") }}
        </div>

        <slot name="dateFilterType" />
      </div>
    </div>

    <div class="grow lg:grow-0"></div>

    <div class="mt-8 flex justify-end gap-3">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserOrders, useUserOrdersFilter } from "../composables";

interface IEmits {
  (event: "apply"): void;
  (event: "reset"): void;
}

defineEmits<IEmits>();

const { facets } = useUserOrders({});
const { filterData, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
