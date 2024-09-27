<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-3 max-lg:hidden" :items="breadcrumbs" />

    <VcTypography tag="h1" class="mb-5">
      {{ $t("pages.bulk_order.title") }}
    </VcTypography>

    <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-5">
      <!-- Mobile Tabs -->
      <VcTabs
        v-model="activeTab"
        :items="tabs"
        text-field="label"
        value-field="id"
        class="col-span-1 border-y bg-additional-50 px-3.5 shadow-sm max-md:-mx-6 md:rounded-t md:border md:px-3 lg:hidden"
      />

      <!-- Main section -->
      <div :class="{ hidden: activeTab !== 'manually' }" class="col-span-1 max-md:-mx-6 lg:col-span-2 lg:block">
        <Manually
          :loading="loadingManually"
          class="bg-additional-50 shadow-sm md:rounded-b md:border-x md:border-b lg:rounded lg:border"
          @add-to-cart="addManuallyItems"
        />
      </div>

      <!-- Sidebar -->
      <div :class="{ hidden: activeTab !== 'copy&paste' }" class="col-span-1 max-md:-mx-6 lg:block">
        <CopyAndPaste
          :loading="loadingCSV"
          class="bg-additional-50 shadow-sm md:rounded-b md:border-x md:border-b lg:rounded lg:border"
          @add-to-cart="addItemsFromCSVText"
        />
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { uniqBy } from "lodash";
import { ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { CopyAndPaste, Manually } from "@/shared/bulk-order";
import { useShortCart } from "@/shared/cart";
import { useModal } from "@/shared/modal";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";
import type { OutputBulkItemType } from "@/shared/cart";
import AddToCartSkuErrorsModal from "@/shared/bulk-order/components/add-to-cart-sku-errors-modal.vue";

const router = useRouter();
const { t } = useI18n();
const { openModal } = useModal();
const { loading: loadingCart, changing: cartChanging, addBulkItemsToCart } = useShortCart();

usePageHead({
  title: t("pages.bulk_order.meta.title"),
  meta: {
    keywords: t("pages.bulk_order.meta.keywords"),
    description: t("pages.bulk_order.meta.description"),
  },
});

const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const tabs = [
  { id: "manually", label: t("pages.bulk_order.manually_tab") },
  { id: "copy&paste", label: t("pages.bulk_order.copy_n_paste_tab") },
] as const;

const loadingManually = ref(false);
const loadingCSV = ref(false);
const activeTab = ref<"manually" | "copy&paste">(tabs[0].id);

const itemsWithErrors = shallowRef<OutputBulkItemType[]>();

async function addItems(items: InputNewBulkItemType[]) {
  if (!items.length || loadingCart.value || cartChanging.value) {
    return;
  }

  const normalizedItems = uniqBy(items, (item) => item.productSku);

  const resultItems = await addBulkItemsToCart(normalizedItems);

  itemsWithErrors.value = resultItems.filter((item) => !!item.errors?.length);

  if (itemsWithErrors.value?.length) {
    const closeAddToCartSkuErrorsModal = openModal({
      component: AddToCartSkuErrorsModal,
      props: {
        errorItems: itemsWithErrors.value,
        async onConfirm(): Promise<void> {
          closeAddToCartSkuErrorsModal();
          await router.push({ name: "Cart" });
        },
      },
    });
  } else {
    await router.push({ name: "Cart" });
  }
}

async function addManuallyItems(items: InputNewBulkItemType[]) {
  loadingManually.value = true;
  await addItems(items);
  loadingManually.value = false;
}

async function addItemsFromCSVText(items: InputNewBulkItemType[]) {
  loadingCSV.value = true;
  await addItems(items);
  loadingCSV.value = false;
}
</script>
