<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <VcTypography tag="h1">{{ $t("purchase_request.title", [purchaseRequest?.number]) }}</VcTypography>

    <VcEmptyView
      v-if="!(loading || changing) && !quote?.items?.length"
      :text="$t('purchase_request.failed_or_used_description')"
      icon="outline-order"
    >
      <template #button>
        <VcButton :to="{ name: 'BulkOrder' }" size="lg">
          {{ $t("purchase_request.try_again") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <VcLayout v-else sidebar-position="right" sticky-sidebar>
      <VcWidget :title="$t('purchase_request.files_section.title')" prepend-icon="document-add" size="lg">
        <VcFileUploader
          class="h-full"
          v-bind="fileOptions"
          :files="files"
          @add-files="onAddFiles"
          @download="onFileDownload"
        />
      </VcWidget>
      <VcWidget id="products" :title="$t('shared.cart.products_section.title')" prepend-icon="cube" size="lg">
        <QuoteLineItems
          v-if="quote?.items?.length"
          :items="quote.items"
          @update:item="changeQuoteItemQuantity"
          @remove:item="removeQuoteItem"
        />
      </VcWidget>
      <template #sidebar>
        <QuoteSummary v-if="purchaseRequest?.quoteId && quote?.items?.length" :quote="quote">
          <template #footer>
            <ProceedTo :to="{ name: 'EditQuote', params: { quoteId: purchaseRequest.quoteId } }">
              {{ $t("purchase_request.go_to_quote") }}
            </ProceedTo>
          </template>
        </QuoteSummary>
      </template>
    </VcLayout>

    <VcLoaderOverlay :visible="loading || changing" fixed-spinning />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { onMounted, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { usePurchaseRequest } from "@/modules/purchase-requests/composables/usePurchaseRequest";
import { ProceedTo } from "@/shared/checkout/components";
import { downloadFile } from "@/shared/files/utils";
import { BackButtonInHeader } from "@/shared/layout";
import QuoteLineItems from "@/modules/quotes/components/quote-line-items.vue";
import QuoteSummary from "@/modules/quotes/components/quote-summary.vue";

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
  changing,
  quote,
  fetchFileOptions,
  updatePurchaseRequestByDocuments,
  changeQuoteItemQuantity,
  removeQuoteItem,
} = usePurchaseRequest(propsRef);

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("purchase_requests.menu.link.title"), route: { name: "PurchaseRequests" } },
  { title: t("purchase_request.title", [purchaseRequest.value?.number]) },
]);

const isMobile = breakpoints.smaller("lg");

async function onAddFiles(items: INewFile[]) {
  await updatePurchaseRequestByDocuments(items);
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

onMounted(async () => {
  await fetchFileOptions();
});
</script>
