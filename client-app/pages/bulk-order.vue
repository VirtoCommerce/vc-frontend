<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-3 max-lg:hidden" :items="breadcrumbs" />

    <VcTypography tag="h1" class="mb-5">
      {{ $t("pages.bulk_order.title") }}
    </VcTypography>

    <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-5">
      <!-- Error section -->
      <transition name="slide-fade-top" mode="out-in">
        <VcAlert
          v-if="SKUsWithErrors.length"
          key="sku"
          class="col-span-1 mb-5 lg:col-span-2 lg:mb-0"
          color="danger"
          size="sm"
          variant="solid-light"
          icon
        >
          <span>{{ $t("pages.bulk_order.product_was_not_added_alert", [SKUsWithErrors.join(", ")]) }}</span>
        </VcAlert>

        <VcAlert
          v-else-if="incorrectData"
          key="incorrect"
          class="col-span-1 mb-5 lg:col-span-2 lg:mb-0"
          color="danger"
          size="sm"
          variant="solid-light"
          icon
        >
          {{ $t("pages.bulk_order.data_is_invalid_alert") }}
        </VcAlert>
      </transition>

      <!-- Mobile Tabs -->
      <VcTabs
        v-model="activeTab"
        :items="tabs"
        text-field="label"
        value-field="id"
        class="col-span-1 border-y bg-white px-3.5 shadow-sm max-md:-mx-6 md:rounded-t md:border md:px-3 lg:hidden"
      />

      <!-- Main section -->
      <div :class="{ hidden: activeTab !== 'manually' }" class="col-span-1 max-md:-mx-6 lg:col-span-2 lg:block">
        <Manually
          :loading="loadingManually"
          class="bg-white shadow-sm md:rounded-b md:border-x md:border-b lg:rounded lg:border"
          @add-to-cart="addManuallyItems"
          @error="showIncorrectDataError"
        />
      </div>

      <!-- Sidebar -->
      <div :class="{ hidden: activeTab !== 'copy&paste' }" class="col-span-1 max-md:-mx-6 lg:block">
        <CopyAndPaste
          :loading="loadingCSV"
          class="bg-white shadow-sm md:rounded-b md:border-x md:border-b lg:rounded lg:border"
          @add-to-cart="addItemsFromCSVText"
          @error="showIncorrectDataError"
        />
      </div>
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { CopyAndPaste, Manually } from "@/shared/bulk-order";
import { useShortCart } from "@/shared/cart";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";

const { t } = useI18n();

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
];

const router = useRouter();
const { loading: loadingCart, changing: cartChanging, addBulkItemsToCart } = useShortCart();

const loadingManually = ref(false);
const loadingCSV = ref(false);
const activeTab = ref<"manually" | "copy&paste">(tabs[0].id as "manually");
const incorrectData = ref(false);
const SKUsWithErrors = ref<string[]>([]);

function showIncorrectDataError() {
  SKUsWithErrors.value = [];
  incorrectData.value = true;
}

async function addItems(items: InputNewBulkItemType[]) {
  incorrectData.value = false;
  SKUsWithErrors.value = [];

  if (!items.length || loadingCart.value || cartChanging.value) {
    return;
  }

  const resultItems = await addBulkItemsToCart(items);

  SKUsWithErrors.value = resultItems.filter((item) => !item.isAddedToCart).map((item) => item.productSku);

  if (SKUsWithErrors.value.length) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
