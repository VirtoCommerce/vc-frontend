<template>
  <div class="lg:!gap-y-7" v-if="quote">
    <div class="flex flex-col gap-3 px-5 lg:px-0">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-3xl font-bold uppercase lg:text-28">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <div class="flex flex-col bg-white lg:bg-transparent lg:flex-row lg:items-start lg:gap-x-6">
      <div class="contents lg:grow lg:block lg:space-y-6">
        <!-- Quote products -->
        <VcSectionWidget
          :title="$t('pages.account.quote_details.products')"
          icon-url="/static/images/products.svg"
          hide-desktop-title
          content-classes="px-6 pt-6 pb-0 md:p-7"
        >
          <QuoteLineItems :items="quote.items!" readonly />
        </VcSectionWidget>

        <!-- Quote comment -->
        <VcSectionWidget
          :title="$t('pages.account.quote_details.remarks')"
          icon-url="/static/images/remarks.svg"
          v-if="quote.comment"
        >
          <div class="text-15 font-medium">
            {{ quote.comment }}
          </div>
        </VcSectionWidget>
      </div>

      <div class="contents lg:block lg:shrink-0 lg:space-y-6 lg:w-1/4 2xl:w-[285px]">
        <VcCardWidget
          :title="$t('pages.account.quote_details.quote_summary')"
          icon-url="/static/images/billing-address.svg"
        >
          <div class="flex justify-between text-base">
            <span class="font-bold" v-t="'pages.account.quote_details.total'" />
            <span class="text-[color:var(--color-price)] text-18 font-extrabold">
              <VcPriceDisplay :value="quote!.totals!.grandTotalInclTax" />
            </span>
          </div>
        </VcCardWidget>

        <VcCardWidget
          :title="$t('pages.account.quote_details.quote_data')"
          hide-mobile-title
          class="-order-1 lg:order-none"
        >
          <div class="-mt-1 mb-1 space-y-1">
            <div class="flex text-base">
              <span class="font-bold mr-2">{{ $t("pages.account.quote_details.created") }}:</span>
              <span>{{ $d(quote!.createdDate, "long") }}</span>
            </div>

            <div class="flex text-base">
              <span class="font-bold mr-2">{{ $t("pages.account.quote_details.status") }}:</span>
              <span>
                <TableStatusBadge :status="quote!.status" />
              </span>
            </div>
          </div>
        </VcCardWidget>

        <VcCardWidget
          v-if="shippingAddress"
          :title="$t('pages.account.quote_details.shipping_address')"
          icon-url="/static/images/shipping-address.svg"
        >
          <div class="-mt-1">
            <VcAddressInfo :address="shippingAddress!" />
          </div>
        </VcCardWidget>

        <VcCardWidget
          v-if="billingAddress"
          :title="$t('pages.account.quote_details.billing_address')"
          icon-url="/static/images/billing-address.svg"
        >
          <div class="-mt-1">
            <VcAddressInfo :address="billingAddress!" />
          </div>
        </VcCardWidget>
      </div>
    </div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useUserQuote, QuoteLineItems } from "@/shared/account";
import { VcAddressInfo } from "@/ui-kit/components";
import { usePageHead } from "@/core/composables";

const props = defineProps({
  quoteId: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const { quote, billingAddress, shippingAddress, clearQuote, fetchQuote } = useUserQuote();

usePageHead({
  title: t("pages.account.quote_details.title", [quote!.value?.number]),
});

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

watchEffect(async () => {
  clearQuote();
  await fetchQuote({ id: props.quoteId });
});
</script>
