<template>
  <div class="orders-filter">
    <VcDialog dividers size="xs">
      <VcDialogHeader @close="$emit('close')">
        {{ $t("shared.account.orders_filter.title") }}
      </VcDialogHeader>

      <VcDialogContent>
        <div class="orders-filter__content">
          <slot />

          <div v-if="facets?.length" class="orders-filter__facets">
            <VcLabel>{{ $t("shared.account.orders_filter.status_label") }}</VcLabel>

            <VcCheckboxGroup v-model="filterData.statuses" class="orders-filter__statuses">
              <VcCheckbox v-for="facet in statusFacet?.items" :key="facet.term" :value="facet.term">
                <div
                  :class="[
                    'orders-filter__status-content',
                    { 'orders-filter__status-content--selected': isSelectedStatus(facet.term) },
                  ]"
                >
                  <div class="orders-filter__status-label">{{ facet.label }}</div>

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

        <VcButton :disabled="!isFilterDirty || !isDateRangeValid" @click="$emit('apply')">
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

interface IProps {
  isDateRangeValid?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), { isDateRangeValid: true });

const { facets } = useUserOrders({});
const { filterData, isFilterEmpty, isFilterDirty } = useUserOrdersFilter();

const statusFacet = computed(() => facets.value?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME));

function isSelectedStatus(status: string) {
  return filterData.value.statuses.indexOf(status) !== -1;
}
</script>

<style lang="scss">
.orders-filter {
  @apply w-[27.5rem];

  &__content {
    @apply flex flex-col;
  }

  &__facets {
    @apply mt-4;
  }

  &__statuses {
    @apply mt-2 space-y-3.5;
  }

  &__status-content {
    @apply flex w-full max-w-full gap-1 text-neutral;

    &--selected {
      @apply font-bold text-inherit;
    }
  }

  &__status-label {
    @apply min-w-0 truncate;
  }
}
</style>
