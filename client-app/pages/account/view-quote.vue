<template>
  <div class="lg:!gap-y-7" v-if="quote">
    <div class="flex flex-col gap-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-3xl font-bold uppercase lg:text-28">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <VcLayoutWithRightSidebar>
      <!-- Quote products -->
      <VcSectionWidget :title="$t('pages.account.quote_details.products')" icon="cube" hide-desktop-title>
        <QuoteLineItems :items="quote.items!" readonly />
      </VcSectionWidget>

      <!-- Quote comment -->
      <VcSectionWidget :title="$t('pages.account.quote_details.remarks')" icon="document-text" v-if="quote.comment">
        <div class="text-15 font-medium">
          {{ quote.comment }}
        </div>
      </VcSectionWidget>

      <template #sidebar>
        <VcCardWidget :title="$t('pages.account.quote_details.quote_summary')" icon="cash">
          <div class="flex justify-between text-base">
            <span class="font-bold" v-t="'pages.account.quote_details.total'" />

            <span class="text-[color:var(--color-price)] text-18 font-extrabold">
              <VcPriceDisplay :value="quote!.totals!.grandTotalInclTax" />
            </span>
          </div>
        </VcCardWidget>

        <VcCardWidget
          :title="$t('pages.account.quote_details.quote_data')"
          class="-order-1 lg:order-none"
          hide-mobile-title
        >
          <div class="space-y-1">
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

        <VcCardWidget v-if="shippingAddress" :title="$t('pages.account.quote_details.shipping_address')" icon="cube">
          <VcAddressInfo :address="shippingAddress!" />
        </VcCardWidget>

        <VcCardWidget v-if="billingAddress" :title="$t('pages.account.quote_details.billing_address')" icon="cash">
          <VcAddressInfo :address="billingAddress!" />
        </VcCardWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useUserQuote, QuoteLineItems } from "@/shared/account";
import { VcAddressInfo } from "@/ui-kit/components";
import { usePageHead, useBreadcrumbs } from "@/core/composables";

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

const breadcrumbs = useBreadcrumbs(
  computed(() => [
    { title: t("common.links.home"), route: { name: "Home" } },
    { title: t("common.links.account"), route: { name: "Account" } },
    { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
    { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
  ])
);

watchEffect(async () => {
  clearQuote();
  await fetchQuote({ id: props.quoteId });
});
</script>
