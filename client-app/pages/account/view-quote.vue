<template>
  <div v-if="quote">
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <!-- Quote products -->
        <VcSection class="pb-2">
          <template #title></template>

          <div class="mx-7 mb-5">
            <QuoteLineItems :items="quote.items!" />
          </div>
        </VcSection>

        <!-- Quote comment -->
        <VcSection v-if="quote.comment">
          <template #title>
            <div class="flex items-center px-7 py-5">
              <VcImage
                :alt="$t('pages.account.quote_details.remarks')"
                src="/static/images/remarks.svg"
                class="mr-4"
                lazy
              />
              <h3 class="text-gray-800 text-xl font-bold uppercase">
                {{ $t("pages.account.quote_details.remarks") }}
              </h3>
            </div>
          </template>

          <div class="mx-7 mb-5">
            <div>{{ quote.comment }}</div>
          </div>
        </VcSection>
      </div>

      <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <VcCard :title="$t('pages.account.quote_details.quote_summary')" class="mb-5" shadow>
          <div class="flex justify-between text-base mb-4">
            <span v-t="'pages.account.quote_details.total'" />
            <span class="font-extrabold">
              <VcPriceDisplay :value="quote!.totals!.grandTotalInclTax" />
            </span>
          </div>
        </VcCard>

        <VcCard :title="$t('pages.account.quote_details.quote_data')" class="mb-5" shadow>
          <div class="flex text-base mb-4">
            <span class="font-bold mr-2">{{ $t("pages.account.quote_details.created") }}:</span>
            <span>{{ $d(quote!.createdDate, "long") }}</span>
          </div>

          <div class="flex text-base mb-4">
            <span class="font-bold mr-2">{{ $t("pages.account.quote_details.status") }}:</span>
            <span>
              <TableStatusBadge :status="quote!.status" />
            </span>
          </div>
        </VcCard>

        <VcCard :title="$t('pages.account.quote_details.shipping_address')" class="mb-5" shadow>
          <VcAddressInfo :address="shippingAddress!" />
        </VcCard>

        <VcCard :title="$t('pages.account.quote_details.billing_address')" class="mb-5" shadow>
          <VcAddressInfo :address="billingAddress!" />
        </VcCard>
      </div>
    </div>

    <div></div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useUserQuote, QuoteLineItems } from "@/shared/account";
import { VcAddressInfo } from "@/ui-kit/components";

const props = defineProps({
  quoteId: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const { quote, billingAddress, shippingAddress, fetchQuote } = useUserQuote();

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

onMounted(async () => {
  await fetchQuote({ id: props.quoteId });
});
</script>
