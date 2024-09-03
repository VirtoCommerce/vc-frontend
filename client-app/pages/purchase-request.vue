<template>
  <VcLoaderOverlay v-if="loading" no-bg />

  <VcEmptyPage
    v-else-if="!cart?.items?.length && !quote?.items?.length"
    :title="$t('pages.purchase_request.title')"
    :description="$t('pages.purchase_request.failed_or_used_description')"
    image="/static/images/errors/emptyCart.webp"
    mobile-image="/static/images/errors/emptyCartMobile.webp"
    :breadcrumbs="breadcrumbs"
  >
    <template #actions>
      <VcButton :to="{ name: 'BulkOrder' }" size="lg">
        {{ $t("pages.purchase_request.try_again") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <VcContainer v-else class="relative z-0">
    <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

    <VcTypography tag="h1" class="mb-5"
      >{{ $t("pages.purchase_request.title") }} {{ purchaseRequest?.number }}</VcTypography
    >

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <VcWidget :title="$t('pages.purchase_request.files_section.title')" prepend-icon="document-add" size="lg">
        <VcFileUploader
          class="h-full"
          v-bind="fileOptions"
          :files="files"
          @add-files="onAddFiles"
          @download="onFileDownload"
        />
      </VcWidget>
      <VcWidget id="products" :title="$t('shared.checkout.products_section.title')" prepend-icon="cube" size="lg">
        <CartLineItems
          v-if="cart?.items?.length"
          :items="cart.items"
          :validation-errors="cart.validationErrors"
          @change:item-quantity="changeCartItemQuantity"
          @remove:items="removeCartItems"
        />
        <QuoteLineItems
          v-if="quote?.items?.length"
          :items="quote.items"
          @update:item="changeQuoteItemQuantity"
          @remove:item="removeQuoteItem"
        />
      </VcWidget>
      <template #sidebar>
        <OrderSummary
          v-if="purchaseRequest?.cartId && cart?.items?.length"
          :cart="cart"
          :no-shipping="allCartItemsAreDigital"
        >
          <template #footer>
            <ProceedTo
              :to="{ name: 'Checkout', params: { cartType: 'PurchaseRequest', cartName: purchaseRequest.number } }"
            >
              {{ $t("common.buttons.go_to_checkout") }}
            </ProceedTo>
          </template>
        </OrderSummary>
        <OrderSummary v-if="purchaseRequest?.quoteId && quote?.items?.length" :cart="quote" no-shipping>
          <template #footer>
            <ProceedTo :to="{ name: 'EditQuote', params: { quoteId: purchaseRequest.quoteId } }">
              {{ $t("pages.purchase_request.go_to_quote") }}
            </ProceedTo>
          </template>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { inject, ref, toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { DEFAULT_PURCHASE_REQUEST_FILES_SCOPE } from "@/shared/bulk-order/constants";
import { OrderSummary, ProceedTo } from "@/shared/checkout/components";
import { useFiles } from "@/shared/files/composables/useFiles";
import { downloadFile } from "@/shared/files/utils";
import { usePurchaseRequest } from "@/shared/purchase-request/composables/usePurchaseRequest";
import QuoteLineItems from "@/shared/account/components/quote-line-items.vue";
import CartLineItems from "@/shared/cart/components/cart-line-items.vue";

interface IProps {
  id: string;
}

const props = defineProps<IProps>();

const propsRef = toRef(props);

const config = inject(configInjectionKey, {});
const { t } = useI18n();

const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const {
  loading,
  purchaseRequest,
  sourceFiles,
  cart,
  allCartItemsAreDigital,
  quote,
  fetchItems,
  changeCartItemQuantity,
  changeQuoteItemQuantity,
  removeCartItems,
  removeQuoteItem,
} = usePurchaseRequest(propsRef);

const {
  files,
  addFiles,
  validateFiles,
  uploadFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(config.purchase_request_file_scope ?? DEFAULT_PURCHASE_REQUEST_FILES_SCOPE, sourceFiles);
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

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

watchEffect(async () => {
  await Promise.all([fetchFileOptions(), fetchItems()]);
});
</script>
