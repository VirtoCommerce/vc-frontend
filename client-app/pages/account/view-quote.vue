<template>
  <div v-if="quote" class="lg:!gap-y-7">
    <div class="mx-5 flex flex-col gap-3 lg:mx-0">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-3xl font-bold uppercase lg:text-28">
        {{ $t("pages.account.quote_details.title", [quote.number]) }}
      </h2>
    </div>

    <VcLayoutWithRightSidebar>
      <!-- Quote products -->
      <VcSectionWidget :title="$t('pages.account.quote_details.products')" icon="cube" hide-desktop-title>
        <QuoteLineItems :items="quote.items!" readonly />
      </VcSectionWidget>

      <!-- Quote comment -->
      <VcSectionWidget v-if="quote.comment" :title="$t('pages.account.quote_details.remarks')" icon="document-text">
        <div class="text-15 font-medium">
          {{ quote.comment }}
        </div>
      </VcSectionWidget>

      <template #sidebar>
        <VcCardWidget :title="$t('pages.account.quote_details.quote_summary')" icon="cash">
          <div class="flex justify-between text-base">
            <span v-t="'pages.account.quote_details.total'" class="font-bold" />

            <span class="text-18 font-extrabold text-[color:var(--color-price)]">
              <VcPriceDisplay :value="quote.totals?.grandTotalInclTax" />
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
              <span class="mr-2 font-bold">{{ $t("pages.account.quote_details.created") }}:</span>

              <span>{{ $d(quote.createdDate) }}</span>
            </div>

            <div class="flex text-base">
              <span class="mr-2 font-bold">{{ $t("pages.account.quote_details.status") }}:</span>

              <span>
                <TableStatusBadge :status="quote.status" />
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
import { watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { QuoteLineItems, useUserQuote } from "@/shared/account";

interface IProps {
  quoteId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { quote, billingAddress, shippingAddress, clearQuote, fetchQuote } = useUserQuote();

usePageHead({
  title: t("pages.account.quote_details.title", [quote.value?.number]),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

watchEffect(async () => {
  clearQuote();
  await fetchQuote({ id: props.quoteId });
});
</script>
