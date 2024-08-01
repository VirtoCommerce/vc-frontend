<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-3 max-lg:hidden" :items="breadcrumbs" />

    <VcTypography tag="h1" class="mb-5">
      {{ $t("pages.bulk_order.title") }}
    </VcTypography>

    <VcTabs v-model="activeTab" :items="tabs" text-field="label" value-field="id" class="mb-5 flex gap-2">
      <template #item="{ item, isActive }">
        <span
          :class="{ 'rounded-sm bg-white !text-black shadow-md': isActive }"
          class="block appearance-none p-1.5 text-primary-700"
        >
          <VcIcon class="vc-button__icon" :name="item['icon']" /> {{ item["label"] }}
        </span>
      </template>
    </VcTabs>

    <!-- Error section -->
    <transition name="slide-fade-top" mode="out-in">
      <VcAlert v-if="SKUsWithErrors.length" key="sku" class="mb-5" color="danger" size="sm" variant="solid-light" icon>
        <span>{{ $t("pages.bulk_order.product_was_not_added_alert", [SKUsWithErrors.join(", ")]) }}</span>
      </VcAlert>

      <VcAlert
        v-else-if="incorrectData"
        key="incorrect"
        class="mb-5"
        color="danger"
        size="sm"
        variant="solid-light"
        icon
      >
        {{ $t("pages.bulk_order.data_is_invalid_alert") }}
      </VcAlert>
    </transition>

    <FromFile class="bg-white shadow-sm" :class="{ hidden: activeTab !== 'from-file' }" />

    <Manually
      :loading="loadingManually"
      :class="{ hidden: activeTab !== 'manually' }"
      class="bg-white shadow-sm"
      @add-to-cart="addManuallyItems"
      @error="showIncorrectDataError"
    />

    <CopyAndPaste
      :loading="loadingCSV"
      :class="{ hidden: activeTab !== 'copy&paste' }"
      class="bg-white shadow-sm"
      @add-to-cart="addItemsFromCSVText"
      @error="showIncorrectDataError"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { FromFile, CopyAndPaste, Manually } from "@/shared/bulk-order";
import { useShortCart } from "@/shared/cart";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";

const { t } = useI18n();
const { isAuthenticated } = useUser();

usePageHead({
  title: t("pages.bulk_order.meta.title"),
  meta: {
    keywords: t("pages.bulk_order.meta.keywords"),
    description: t("pages.bulk_order.meta.description"),
  },
});

const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const allTabs = [
  { id: "from-file", icon: "cloud-upload", label: t("pages.bulk_order.from_file_tab") },
  { id: "copy&paste", icon: "document-duplicate", label: t("pages.bulk_order.copy_n_paste_tab") },
  { id: "manually", icon: "hand", label: t("pages.bulk_order.manually_tab") },
] as const;
const tabs = computed(() => (isAuthenticated.value ? [...allTabs] : allTabs.slice(1)));
const _activeTab = ref<(typeof allTabs)[number]["id"]>();
const activeTab = computed({
  get: () => _activeTab.value ?? (isAuthenticated.value ? "from-file" : "manually"),
  set: (value) => {
    _activeTab.value = value;
  },
});

const router = useRouter();
const { loading: loadingCart, changing: cartChanging, addBulkItemsToCart } = useShortCart();

const loadingManually = ref(false);
const loadingCSV = ref(false);
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
