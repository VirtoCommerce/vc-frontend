<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner grow">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <VcBreadcrumbs class="mb-3 hidden lg:block" :items="breadcrumbs" />

      <h2
        class="text-gray-800 px-6 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-5"
        v-t="'pages.bulk_order.title'"
      />

      <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-y-5 lg:gap-5">
        <!-- Error section -->
        <transition name="slide-fade-top" mode="out-in">
          <VcAlert
            v-if="SKUsWithErrors.length"
            class="mx-6 md:mx-0 mb-5 lg:mb-0 col-span-1 lg:col-span-2"
            type="danger"
            key="sku"
            icon
          >
            <span>{{ $t("pages.bulk_order.product_was_not_added_alert", [SKUsWithErrors.join(", ")]) }}</span>
          </VcAlert>

          <VcAlert
            v-else-if="incorrectData"
            key="incorrect"
            class="mx-6 md:mx-0 mb-5 lg:mb-0 col-span-1 lg:col-span-2"
            type="danger"
            icon
          >
            <span v-t="'pages.bulk_order.data_is_invalid_alert'"></span>
          </VcAlert>
        </transition>

        <!-- Mobile Tabs -->
        <VcTabs
          v-model="activeTab"
          :items="tabs"
          text-field="label"
          value-field="id"
          class="lg:hidden col-span-1 px-3.5 md:px-3 bg-white border-y md:border md:rounded-t shadow-sm"
        />

        <!-- Main section -->
        <div :class="{ hidden: activeTab !== 'manually' }" class="lg:block col-span-1 lg:col-span-2">
          <Manually
            :loading="loadingManually"
            @add-to-cart="addManuallyItems"
            @error="showIncorrectDataError"
            class="bg-white md:rounded-b lg:rounded md:border-x md:border-b lg:border shadow-sm"
          />
        </div>

        <!-- Sidebar -->
        <div :class="{ hidden: activeTab !== 'copy&paste' }" class="lg:block col-span-1">
          <CopyAndPaste
            :loading="loadingCSV"
            @add-to-cart="addItemsFromCSVText"
            @error="showIncorrectDataError"
            class="bg-white md:rounded-b lg:rounded md:border-x md:border-b lg:border shadow-sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CopyAndPaste, Manually } from "@/shared/bulk-order";
import { InputNewBulkItemType } from "@/xapi/types";
import { useCart } from "@/shared/cart";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const { t } = useI18n();

usePageHead({
  title: t("pages.bulk_order.meta.title"),
  meta: {
    keywords: t("pages.bulk_order.meta.keywords"),
    description: t("pages.bulk_order.meta.description"),
  },
});

const breadcrumbs: IBreadcrumbs[] = [
  { route: "/", title: t("pages.compare.links.home") },
  { title: t("pages.bulk_order.title") },
];

const tabs = [
  { id: "manually", label: t("pages.bulk_order.manually_tab") },
  { id: "copy&paste", label: t("pages.bulk_order.copy_n_paste_tab") },
];

const router = useRouter();
const { loading: loadingCart, addBulkItemsToCart } = useCart();

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

  if (!items.length || loadingCart.value) {
    return;
  }

  const resultItems = await addBulkItemsToCart(items);

  SKUsWithErrors.value = resultItems.filter((item) => item.errors?.length).map((item) => item.productSku);

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
