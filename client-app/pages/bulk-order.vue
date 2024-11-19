<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-3 max-lg:hidden" :items="breadcrumbs" />

    <VcTypography tag="h1" class="mb-5">
      {{ $t("pages.bulk_order.title") }}
    </VcTypography>

    <VcTabs v-model="activeTab" :items="tabs" text-field="label" value-field="id" class="mb-5">
      <template #item="{ item, isActive }">
        <VcIcon class="me-1" :class="{ 'fill-primary-500': !isActive }" :name="item['icon']" />
        <span>{{ item["label"] }}</span>
      </template>
    </VcTabs>

    <div v-for="tab in additionalTabs" :key="tab.id">
      <component :is="tab.element" :class="{ hidden: activeTab !== tab.id }" />
    </div>

    <Manually
      :loading="loadingManually"
      :class="{ hidden: activeTab !== 'manually' }"
      @add-to-cart="addManuallyItems"
    />

    <CopyAndPaste
      :loading="loadingCSV"
      :class="{ hidden: activeTab !== 'copy&paste' }"
      @add-to-cart="addItemsFromCSVText"
    />
  </VcContainer>
</template>

<script setup lang="ts">
import { uniqBy } from "lodash";
import { computed, ref, shallowRef, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { CopyAndPaste, Manually } from "@/shared/bulk-order";
import { useBulkOrderExtensionPoints } from "@/shared/bulk-order/composables/useBulkOrderExtensionPoints";
import { useShortCart } from "@/shared/cart";
import { useModal } from "@/shared/modal";
import type { InputNewBulkItemType } from "@/core/api/graphql/types";
import type { ITab } from "@/shared/bulk-order/composables/useBulkOrderExtensionPoints";
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

const { additionalTabs } = useBulkOrderExtensionPoints();

const predefinedTabs: Omit<ITab, "element">[] = [
  { id: "copy&paste", icon: "document-duplicate", label: t("pages.bulk_order.copy_n_paste_tab") },
  { id: "manually", icon: "hand", label: t("pages.bulk_order.manually_tab") },
];
const tabs = computed(() => [...additionalTabs.value.filter((tab) => !toValue(tab.hidden)), ...predefinedTabs]);
const _activeTab = ref<string>();
const activeTab = computed({
  get: () => _activeTab.value ?? tabs.value[0].id,
  set: (value) => {
    _activeTab.value = value;
  },
});

const loadingManually = ref(false);
const loadingCSV = ref(false);

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
