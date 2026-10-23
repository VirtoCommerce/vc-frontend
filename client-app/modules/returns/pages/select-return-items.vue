<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <VcTypography tag="h1">{{ $t("returns.select_items.title") }}</VcTypography>

    <VcEmptyView
      v-if="!loading && !items.length"
      :text="$t('returns.select_items.nothing_returnable')"
      icon="outline-order"
    />

    <template v-else>
      <!--
        Nothing returnable is said once, above the table, rather than instead of it: every line
        carries its own reason and the buyer needs to read them to know what to do next.
      -->
      <VcAlert v-if="!loading && !returnableItems.length" color="warning" variant="soft" size="sm" class="mb-5" icon>
        {{ $t("returns.select_items.nothing_returnable") }}
      </VcAlert>

      <VcAlert v-else-if="windowDays" color="info" variant="soft" size="sm" class="mb-5" icon>
        {{ $t("returns.select_items.window_hint", { days: windowDays }) }}
      </VcAlert>

      <VcWidget size="lg">
        <template #default-container>
          <div class="flex items-center justify-between border-b border-neutral-200 p-5">
            <VcCheckbox :model-value="allSelected" :disabled="!returnableItems.length" @change="toggleAll">
              {{ $t("returns.select_items.select_all") }}
            </VcCheckbox>

            <span class="text-sm text-neutral-600">
              {{ $t("returns.select_items.eligible_count", { eligible: returnableItems.length, total: items.length }) }}
            </span>
          </div>

          <VcTable
            :items="items"
            :description="$t('returns.select_items.table_description')"
            class="select-return-items__lines"
            hide-default-footer
            mobile-breakpoint="lg"
            mobile-cards
          >
            <template #mobile-item="{ item }">
              <VcRecordCard :title="item.name" :description="getItemCaption(item)" :meta="getItemMeta(item)">
                <template v-if="item.imageUrl" #lead>
                  <ReturnItemImage :src="item.imageUrl" />
                </template>

                <template v-if="item.ineligibilityReason || item.isReturnable" #default>
                  <div v-if="item.ineligibilityReason" class="select-return-items__reason">
                    {{ codeText("ineligibility", item.ineligibilityReason) }}
                  </div>

                  <div v-if="item.isReturnable" class="select-return-items__quantity">
                    <span>{{ $t("returns.select_items.columns.quantity") }}</span>

                    <ReturnQuantityInput
                      :model-value="quantities[item.orderLineItemId] ?? 0"
                      :max="item.returnableQuantity"
                      :label="$t('returns.select_items.quantity_for', { name: item.name })"
                      @update:model-value="setQuantity(item, $event)"
                    />
                  </div>
                </template>
              </VcRecordCard>
            </template>

            <VcTableColumn id="item" v-slot="{ item }" :title="$t('returns.select_items.columns.item')">
              <div :class="{ 'text-neutral-600': !item.isReturnable }">{{ item.name }}</div>

              <div class="text-sm text-neutral-600">
                {{ [item.sku, item.measureUnit].filter(Boolean).join(" · ") }}
              </div>

              <div v-if="item.ineligibilityReason" class="text-sm text-warning-700">
                {{ codeText("ineligibility", item.ineligibilityReason) }}
              </div>
            </VcTableColumn>

            <VcTableColumn
              id="ordered"
              v-slot="{ item }"
              :title="$t('returns.select_items.columns.ordered')"
              align="right"
            >
              <span :class="{ 'text-neutral-600': !item.isReturnable }">{{ item.orderedQuantity }}</span>
            </VcTableColumn>

            <VcTableColumn
              id="returnable"
              v-slot="{ item }"
              :title="$t('returns.select_items.columns.returnable')"
              align="right"
            >
              <span :class="{ 'text-neutral-600': !item.isReturnable }">{{ item.returnableQuantity }}</span>
            </VcTableColumn>

            <VcTableColumn
              id="quantity"
              v-slot="{ item }"
              :title="$t('returns.select_items.columns.quantity')"
              align="right"
            >
              <ReturnQuantityInput
                v-if="item.isReturnable"
                :model-value="quantities[item.orderLineItemId] ?? 0"
                :max="item.returnableQuantity"
                :label="$t('returns.select_items.quantity_for', { name: item.name })"
                @update:model-value="setQuantity(item, $event)"
              />

              <span v-else class="text-neutral-600">&mdash;</span>
            </VcTableColumn>
          </VcTable>

          <div class="flex items-center justify-between p-5">
            <span class="text-sm text-neutral-600">
              {{
                $t("returns.select_items.selected_summary", {
                  lines: selectedItems.length,
                  quantity: selectedQuantity,
                })
              }}
            </span>

            <VcButton :disabled="!selectedItems.length" :loading="creating" @click="onContinue">
              {{ $t("returns.select_items.continue") }}
            </VcButton>
          </div>
        </template>
      </VcWidget>
    </template>

    <VcLoaderOverlay :visible="loading" fixed-spinning />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs } from "@/core/composables";
import { usePageHead } from "@/core/composables/usePageHead";
import { useReturnErrors } from "@/modules/returns/composables/useReturnErrors";
import { useReturnPolicy } from "@/modules/returns/composables/useReturnPolicy";
import { useReturnableItems } from "@/modules/returns/composables/useReturnableItems";
import { BackButtonInHeader } from "@/shared/layout";
import type { ReturnableItemType } from "@/modules/returns/api/graphql/types";
import ReturnItemImage from "@/modules/returns/components/return-item-image.vue";
import ReturnQuantityInput from "@/modules/returns/components/return-quantity-input.vue";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: computed(() => t("returns.select_items.meta_title")),
});

const {
  loading,
  creating,
  items,
  returnableItems,
  quantities,
  selectedItems,
  selectedQuantity,
  allSelected,
  setQuantity,
  toggleAll,
  createDraft,
} = useReturnableItems(toRef(props, "orderId"));

const { windowDays } = useReturnPolicy();

const { codeText } = useReturnErrors();

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("returns.menu.link.title"), route: { name: "Returns" } },
  { title: t("returns.select_items.title") },
]);

const isMobile = breakpoints.smaller("lg");

function getItemCaption(item: ReturnableItemType): string {
  return [item.sku, item.measureUnit].filter(Boolean).join(" · ");
}

function getItemMeta(item: ReturnableItemType): VcRecordCardMetaItemType[] {
  return [
    { icon: "package", text: t("returns.select_items.ordered_count", { count: item.orderedQuantity }) },
    { icon: "undo-2", text: t("returns.select_items.returnable_count", { count: item.returnableQuantity }) },
  ];
}

async function onContinue(): Promise<void> {
  const draft = await createDraft();

  if (draft) {
    await router.push({ name: "EditReturn", params: { returnId: draft.id } });
  }
}
</script>

<style lang="scss">
.select-return-items {
  // Keeps the mobile cards off the edges of the widget, between the select-all row and the summary row.
  &__lines {
    @media (width < theme("screens.lg")) {
      @apply m-4;
    }
  }

  &__reason {
    @apply text-warning-700;
  }

  &__quantity {
    @apply mt-2 flex items-center justify-between gap-3;
  }
}
</style>
