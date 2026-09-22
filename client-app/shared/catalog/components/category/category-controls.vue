<template>
  <div class="category-controls">
    <!-- Purchased before -->
    <!-- The hint hangs on the whole control, not on its label: VcSwitch renders the label slot inside a
         button of its own, and a tooltip trigger there would be a button inside a button. -->
    <VcTooltip v-if="isPurchasedBeforeEnabled" hover>
      <template #trigger>
        <VcSwitch
          v-model="savedPurchasedBefore"
          :disabled="loading"
          :aria-label="$t('pages.catalog.purchased_before_filter_card.checkbox_label')"
          size="sm"
          label-position="right"
          test-id="purchased-before-checkbox-filter"
          @change="$emit('applyPurchasedBefore')"
        >
          <span
            class="category-controls__label"
            :class="{
              'category-controls__label--muted': !savedPurchasedBefore,
            }"
          >
            {{ $t("pages.catalog.purchased_before_filter_card.checkbox_label") }}
          </span>
        </VcSwitch>
      </template>

      <template #content>
        {{ $t("pages.catalog.purchased_before_filter_card.tooltip_text") }}
      </template>
    </VcTooltip>

    <!-- In Stock -->
    <VcTooltip hover>
      <template #trigger>
        <VcSwitch
          v-model="savedInStock"
          :disabled="loading"
          :aria-label="$t('pages.catalog.instock_filter_card.checkbox_label')"
          size="sm"
          label-position="right"
          @change="$emit('applyInStock')"
        >
          <span
            class="category-controls__label"
            :class="{
              'category-controls__label--muted': !savedInStock,
            }"
          >
            {{ $t("pages.catalog.instock_filter_card.checkbox_label") }}
          </span>
        </VcSwitch>
      </template>

      <template #content>
        {{ $t("pages.catalog.instock_filter_card.tooltip_text") }}
      </template>
    </VcTooltip>

    <!-- Branch availability -->
    <!-- A switch, like the two beside it: all three narrow the listing, and a checkbox here read as a
         different kind of condition. Picking the branches still happens in the modal it opens. -->
    <VcTooltip hover width="13rem">
      <template #trigger>
        <VcSwitch
          :model-value="!!savedBranches.length"
          :disabled="loading"
          :aria-label="$t('pages.catalog.branch_availability_filter_card.select_branch_text')"
          size="sm"
          label-position="right"
          @change="$emit('openBranchesModal', false)"
        >
          <i18n-t
            keypath="pages.catalog.branch_availability_filter_card.available_in"
            tag="span"
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
        </VcSwitch>
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
  @apply flex items-center gap-4 justify-end;

  // The tooltip wraps each switch in two blocks, and the inner one is a 24px line box with the
  // inline-flex switch sitting on its baseline — 18px of switch at the top of 24px of line. That put
  // every switch 3px above the rails beside it.
  > .vc-tooltip,
  > .vc-tooltip > .vc-popover__trigger {
    @apply flex items-center;
  }

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
    @apply whitespace-nowrap text-sm;

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
