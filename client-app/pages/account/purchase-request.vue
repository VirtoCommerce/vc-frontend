<template>
  <div class="relative flex w-full min-w-0 flex-col gap-y-5">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <VcTypography tag="h1">{{ $t("pages.account.purchase_request.title", [purchaseRequest?.number]) }}</VcTypography>

    <VcEmptyView
      v-if="!cart?.items?.length && !quote?.items?.length"
      class="lg:mt-32"
      :text="$t('pages.account.purchase_request.failed_or_used_description')"
    >
      <template #icon>
        <VcImage :alt="$t('shared.wishlists.list_details.list_icon')" src="/static/images/common/order.svg" />
      </template>
      <template #button>
        <VcButton :to="{ name: 'BulkOrder' }" size="lg">
          {{ $t("pages.account.purchase_request.try_again") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <VcLayoutWithRightSidebar v-else is-sidebar-sticky>
      <VcWidget :title="$t('pages.account.purchase_request.files_section.title')" prepend-icon="document-add" size="lg">
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
              {{ $t("pages.account.purchase_request.go_to_quote") }}
            </ProceedTo>
          </template>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </div>

  <VcLoaderOverlay :visible="loading || updatingPurchaseRequest" fixed-spinning />
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { toRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { OrderSummary, ProceedTo } from "@/shared/checkout/components";
import { downloadFile } from "@/shared/files/utils";
import { BackButtonInHeader } from "@/shared/layout";
import { usePurchaseRequest } from "@/shared/purchase-request/composables/usePurchaseRequest";
import QuoteLineItems from "@/modules/quotes/components/quote-line-items.vue";
import CartLineItems from "@/shared/cart/components/cart-line-items.vue";

interface IProps {
  purchaseRequestId: string;
}

const props = defineProps<IProps>();

const propsRef = toRef(props);

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);

const {
  loading,
  purchaseRequest,
  files,
  fileOptions,
  updatingPurchaseRequest,
  cart,
  allCartItemsAreDigital,
  quote,
  fetchFileOptions,
  updatePurchaseRequestByDocuments,
  refetch,
  fetchItems,
  changeCartItemQuantity,
  changeQuoteItemQuantity,
  removeCartItems,
  removeQuoteItem,
} = usePurchaseRequest(propsRef);

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.purchase_requests"), route: { name: "PurchaseRequests" } },
  { title: t("pages.account.purchase_request.title", [purchaseRequest.value?.number]) },
]);

const isMobile = breakpoints.smaller("lg");

async function onAddFiles(items: INewFile[]) {
  await updatePurchaseRequestByDocuments(items);
  await refetch();
  await fetchItems();
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
