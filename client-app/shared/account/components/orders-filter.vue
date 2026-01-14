<template>
  <div class="w-[27.5rem]">
    <VcDialog dividers size="xs">
      <VcDialogHeader @close="$emit('close')">
        {{ $t("shared.account.orders_filter.title") }}
      </VcDialogHeader>

      <VcDialogContent>
        <div class="flex flex-col gap-5">
          <slot />

          <div v-if="facets?.length">
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

                  <VcBadge variant="outline" size="sm" rounded>{{ facet.count }}</VcBadge>
                </div>
              </VcCheckbox>
            </VcCheckboxGroup>
          </div>
        </div>
      </VcDialogContent>

      <VcDialogFooter>
        <VcButton
          color="secondary"
          variant="outline"
          :disabled="isFilterEmpty && !isFilterDirty"
          @click="$emit('reset')"
        >
          {{ $t("shared.account.orders_filter.reset_button") }}
        </VcButton>

        <VcButton :disabled="!isFilterDirty" @click="$emit('apply')">
          {{ $t("shared.account.orders_filter.apply_button") }}
        </VcButton>
      </VcDialogFooter>
    </VcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { useUserOrders } from "../composables";
import { useUserOrdersFilter } from "../composables/useUserOrdersFilter";

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
