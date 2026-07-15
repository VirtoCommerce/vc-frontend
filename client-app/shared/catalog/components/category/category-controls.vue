<template>
  <div class="category-controls">
    <!-- Purchased before -->
    <VcCheckbox
      v-if="isPurchasedBeforeEnabled"
      v-model="savedPurchasedBefore"
      :disabled="loading"
      data-test-id="purchased-before-checkbox-filter"
      @click="$emit('applyPurchasedBefore')"
      @keyup.enter="$emit('applyPurchasedBefore')"
    >
      <span
        class="category-controls__label"
        :class="{
          'category-controls__label--muted': !savedPurchasedBefore,
        }"
      >
        {{ $t("pages.catalog.purchased_before_filter_card.checkbox_label") }}
      </span>

      <template #tooltip>
        {{ $t("pages.catalog.purchased_before_filter_card.tooltip_text") }}
      </template>
    </VcCheckbox>

    <!-- In Stock -->
    <VcCheckbox
      v-model="savedInStock"
      :disabled="loading"
      @click="$emit('applyInStock')"
      @keyup.enter="$emit('applyInStock')"
    >
      <span
        class="category-controls__label"
        :class="{
          'category-controls__label--muted': !savedInStock,
        }"
      >
        {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
      </span>

      <template #tooltip>
        {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
      </template>
    </VcCheckbox>

    <!-- Branch availability -->
    <VcCheckbox
      :model-value="!!savedBranches.length"
      :disabled="loading"
      :tooltip="{ width: '13rem' }"
      @click.prevent="$emit('openBranchesModal', false)"
      @keyup.enter.prevent="$emit('openBranchesModal', false)"
    >
      <i18n-t
        keypath="pages.catalog.branch_availability_filter_card.available_in"
        tag="div"
        class="category-controls__availability"
        :class="{
          'category-controls__availability--muted': !savedBranches.length,
        }"
        scope="global"
      >
        <span
          class="category-controls__branches"
          :class="{ 'category-controls__branches--active': savedBranches.length }"
        >
          {{ $t("pages.catalog.branch_availability_filter_card.branches", { n: savedBranches.length }) }}
        </span>
      </i18n-t>

      <template #tooltip>
        {{ $t("pages.catalog.branch_availability_filter_card.select_branch_text") }}
      </template>
    </VcCheckbox>
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

  &__label {
    @apply whitespace-nowrap text-sm;

    &--muted {
      @apply text-neutral;
    }
  }

  &__availability {
    @apply text-sm;

    &--muted {
      @apply text-neutral;
    }
  }

  &__branches {
    &--active {
      @apply font-bold;

      color: var(--link-color);
    }
  }
}
</style>
