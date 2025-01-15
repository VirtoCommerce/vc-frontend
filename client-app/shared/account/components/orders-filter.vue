<template>
  <div class="w-[27.5rem]">
    <VcDialog dividers>
      <VcDialogHeader @close="$emit('close')">Title</VcDialogHeader>

      <VcDialogContent>
        <div v-if="!!facets" class="space-y-4">
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
import { useUserOrders, useUserOrdersFilter } from "../composables";

interface IEmits {
  (event: "apply"): void;
  (event: "reset"): void;
  (event: "close"): void;
}

interface IProps {
  isOpened?: boolean;
}

defineEmits<IEmits>();
defineProps<IProps>();

const { facets } = useUserOrders({});
const { filterData, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>
