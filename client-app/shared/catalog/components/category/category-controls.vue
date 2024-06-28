<template>
  <!-- Branch availability -->
  <div
    role="button"
    tabindex="0"
    class="order-3 ml-4 flex items-center xl:ml-6"
    @click.prevent="$emit('openBranchesModal', false)"
    @keyup.enter.prevent="$emit('openBranchesModal', false)"
  >
    <VcTooltip placement="bottom-start" width="13rem">
      <template #trigger>
        <VcCheckbox :model-value="!!savedBranches.length" :disabled="loading">
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

  <!-- In Stock -->
  <div class="order-2 ml-4 flex items-center xl:ml-8">
    <VcTooltip placement="bottom-start" width="12rem">
      <template #trigger>
        <VcCheckbox v-model="savedInStock" :disabled="loading">
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
  </div>
</template>

<script setup lang="ts">
defineEmits<IEmits>();
defineProps<IProps>();

interface IEmits {
  (event: "openBranchesModal", value: boolean): void;
}

const savedInStock = defineModel<boolean>();

interface IProps {
  savedBranches: string[];
  loading: boolean;
}
</script>
