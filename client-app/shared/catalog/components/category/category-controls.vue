<template>
  <div class="category-controls">
    <!-- Purchased before -->
    <VcTooltip v-if="isPurchasedBeforeEnabled" placement="bottom-start" width="12rem">
      <template #trigger>
        <VcCheckbox
          v-model="savedPurchasedBefore"
          :disabled="loading"
          data-test-id="purchased-before-checkbox-filter"
          @click="$emit('applyPurchasedBefore')"
          @keyup.enter="$emit('applyPurchasedBefore')"
        >
          <span
            class="whitespace-nowrap text-sm"
            :class="{
              'text-neutral': !savedPurchasedBefore,
            }"
          >
            {{ $t("pages.catalog.purchased_before_filter_card.checkbox_label") }}
          </span>
        </VcCheckbox>
      </template>

      <template #content>
        {{ $t("pages.catalog.purchased_before_filter_card.tooltip_text") }}
      </template>
    </VcTooltip>

    <!-- In Stock -->
    <VcTooltip placement="bottom-start" width="12rem">
      <template #trigger>
        <VcCheckbox
          v-model="savedInStock"
          :disabled="loading"
          @click="$emit('applyInStock')"
          @keyup.enter="$emit('applyInStock')"
        >
          <span
            class="whitespace-nowrap text-sm"
            :class="{
              'text-neutral': !savedInStock,
            }"
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </span>
        </VcCheckbox>
      </template>

      <template #content>
        {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
      </template>
    </VcTooltip>

    <!-- Branch availability -->
    <VcTooltip placement="bottom-start" width="13rem">
      <template #trigger>
        <VcCheckbox
          :model-value="!!savedBranches.length"
          :disabled="loading"
          @click.prevent="$emit('openBranchesModal', false)"
          @keyup.enter.prevent="$emit('openBranchesModal', false)"
        >
          <i18n-t
            keypath="pages.catalog.branch_availability_filter_card.available_in"
            tag="div"
            class="text-sm"
            :class="{
              'text-neutral': !savedBranches.length,
            }"
            scope="global"
          >
            <span :class="{ 'font-bold text-[--link-color]': savedBranches.length }">
              {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: savedBranches.length }) }}
            </span>
          </i18n-t>
        </VcCheckbox>
      </template>

      <template #content>
        {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
      </template>
    </VcTooltip>
  </div>
</template>

<script setup lang="ts">
import { usePurchasedBefore } from "@/shared/catalog/composables";

defineEmits<IEmits>();

defineProps<IProps>();

const { isPurchasedBeforeEnabled } = usePurchasedBefore();

interface IEmits {
  (event: "openBranchesModal", value: boolean): void;
  (event: "applyInStock"): void;
  (event: "applyPurchasedBefore"): void;
}

const savedInStock = defineModel<boolean>();
const savedPurchasedBefore = defineModel<boolean>("purchased-before");

interface IProps {
  savedBranches: string[];
  loading: boolean;
}
</script>

<style lang="scss">
.category-controls {
  @apply flex gap-4 justify-end;

  @media (min-width: theme("screens.xl")) {
    @apply gap-6;
  }
}
</style>
