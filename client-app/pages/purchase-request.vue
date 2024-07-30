<template>
  <VcLoaderOverlay v-if="loading" no-bg />

  <VcContainer v-else class="relative z-0">
    <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

    <VcTypography tag="h1" class="mb-5"
      >{{ $t("pages.purchase_request.title") }} {{ purchaseRequest?.number }}</VcTypography
    >
    <VcLayoutWithRightSidebar v-if="cart" is-sidebar-sticky>
      <VcWidget :title="$t('pages.purchase_request.files_section.title')" prepend-icon="document-add" size="lg">
        <VcFileUploader class="h-full" v-bind="fileOptions" :files="files" @add-files="onAddFiles" />
      </VcWidget>
      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :selected-item-ids="selectedItemIds"
        :validation-errors="cart.validationErrors"
        with-title
        @change:item-quantity="changeItemQuantity($event.itemId, $event.quantity)"
      />

      <template #sidebar>
        <OrderSummary :cart="cart" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
          <template #footer>
            <ProceedTo
              :to="{ name: 'Checkout', query: { cartType: 'PurchaseRequest', cartName: purchaseRequest?.number } }"
              :disabled="hasOnlyUnselectedLineItems"
            >
              {{ $t("common.buttons.go_to_checkout") }}
            </ProceedTo>
          </template>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { inject, ref, toRef, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { DEFAULT_PURCHASE_REQUEST_FILES_SCOPE } from "@/shared/bulk-order/constants";
import { useFullCart } from "@/shared/cart/composables/useCart";
import { useFiles } from "@/shared/files/composables/useFiles";
import { usePurchaseRequest } from "@/shared/purchase-request/composables/usePurchaseRequest";
import ProductsSection from "@/shared/cart/components/products-section.vue";
import OrderSummary from "@/shared/checkout/components/order-summary.vue";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

interface IProps {
  id: string;
}

const props = defineProps<IProps>();

const propsRef = toRef(props);

const config = inject(configInjectionKey, {});
const { t } = useI18n();

const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const { purchaseRequest, sourceFiles } = usePurchaseRequest(propsRef);

const {
  files,
  addFiles,
  validateFiles,
  uploadFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(config.purchase_request_file_scope ?? DEFAULT_PURCHASE_REQUEST_FILES_SCOPE, sourceFiles);

const {
  cart,
  loading,
  lineItemsGroupedByVendor,
  hasOnlyUnselectedLineItems,
  selectedItemIds,
  selectedLineItems,
  allItemsAreDigital,
  changeItemQuantity,
  forceFetch,
} = useFullCart();

const processing = ref(false);

async function onAddFiles(items: INewFile[]) {
  processing.value = true;

  addFiles(items);
  validateFiles();
  await uploadFiles();

  const documentUrl = files.value[0]?.url;
  if (documentUrl) {
    // TODO
  }

  processing.value = false;
}

watchEffect(async () => {
  await Promise.all([fetchFileOptions()]);
});
watch(
  purchaseRequest,
  async (x) => {
    if (x) {
      await forceFetch({
        cartName: x.number,
        cartType: "purchaseRequest",
      });
    }
  },
  { immediate: true },
);
</script>
