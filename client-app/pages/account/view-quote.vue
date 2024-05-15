<template>
  <div v-if="quote">
    <div class="space-y-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <div class="flex flex-col gap-2.5 lg:flex-row lg:justify-between">
        <VcTypography tag="h1">
          {{ $t("pages.account.quote_details.title", [quote.number]) }}
        </VcTypography>

        <div v-if="quote.status === 'Proposal sent'" class="flex flex-wrap gap-3">
          <VcButton variant="outline" @click="decline">
            {{ $t("common.buttons.decline") }}
          </VcButton>
          <VcButton @click="approve">
            {{ $t("common.buttons.approve") }}
          </VcButton>
        </div>
      </div>
    </div>

    <VcLayoutWithRightSidebar>
      <!-- Quote products -->
      <VcWidget size="lg">
        <QuoteLineItems :items="quote.items!" readonly />
      </VcWidget>

      <!-- Quote comment -->
      <VcWidget
        v-if="quote.comment"
        :title="$t('pages.account.quote_details.comment')"
        prepend-icon="document-text"
        size="lg"
      >
        <div class="text-base font-medium">
          {{ quote.comment }}
        </div>
      </VcWidget>

      <VcWidget v-if="quote.attachments?.length" :title="$t('pages.account.quote_details.files')" size="lg">
        <ul class="space-y-2 rounded border border-[--color-neutral-200] px-3 py-4">
          <li v-for="(attachment, index) in quote.attachments" :key="index">
            <VcFile :file="getFile(attachment)" native-download />
          </li>
        </ul>
      </VcWidget>

      <template #sidebar>
        <VcWidget :title="$t('pages.account.quote_details.quote_summary')">
          <div class="flex justify-between text-base">
            <span v-t="'pages.account.quote_details.subTotal'" class="font-bold" />

            <span class="text-18 font-extrabold text-[color:var(--color-price)]">
              <VcPriceDisplay :value="quote.totals?.subTotalExlTax" />
            </span>
          </div>
          <div class="border-y py-2 text-base font-normal">
            <div class="flex justify-between text-base">
              <span v-t="'pages.account.quote_details.discountTotal'" />

              <span>
                <VcPriceDisplay :value="quote.totals?.discountTotal" />
              </span>
            </div>
            <div class="flex justify-between text-base">
              <span v-t="'pages.account.quote_details.shippingTotal'" />

              <span>
                <VcPriceDisplay :value="quote.totals?.shippingTotal" />
              </span>
            </div>
            <div class="flex justify-between text-base">
              <span v-t="'pages.account.quote_details.taxTotal'" />

              <span class="">
                <VcPriceDisplay :value="quote.totals?.taxTotal" />
              </span>
            </div>
          </div>
          <div class="flex justify-between text-base">
            <span v-t="'pages.account.quote_details.total'" class="font-bold" />

            <span class="text-lg font-extrabold text-success-700">
              <VcPriceDisplay :value="quote.totals?.grandTotalInclTax" />
            </span>
          </div>
        </VcWidget>

        <VcWidget :title="$t('pages.account.quote_details.quote_data')" class="-order-1 lg:order-none">
          <div class="space-y-1">
            <div class="flex text-base">
              <span class="mr-2 font-bold">{{ $t("pages.account.quote_details.created") }}:</span>

              <span>{{ $d(quote.createdDate) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-base font-bold">{{ $t("pages.account.quote_details.status") }}:</span>

              <QuoteStatus class="min-w-[7.785rem]" :status="quote.status" />
            </div>
          </div>
        </VcWidget>

        <VcWidget v-if="shippingAddress" :title="$t('pages.account.quote_details.shipping_address')">
          <VcAddressInfo :address="shippingAddress!" />
        </VcWidget>

        <VcWidget v-if="billingAddress" :title="$t('pages.account.quote_details.billing_address')">
          <VcAddressInfo :address="billingAddress!" />
        </VcWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { QuoteLineItems, useUserQuote, QuoteStatus } from "@/shared/account";
import { useNotifications } from "@/shared/notification";
import type { QuoteAttachmentType } from "@/core/api/graphql/types";

interface IProps {
  quoteId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { quote, billingAddress, approveItem, declineItem, shippingAddress, clearQuote, fetchQuote } = useUserQuote();
const notification = useNotifications();
const router = useRouter();

usePageHead({
  title: t("pages.account.quote_details.title", [quote!.value?.number]),
});

async function approve() {
  try {
    const result = await approveItem(quote.value!.id);
    await router.push({ name: "OrderDetails", params: { orderId: result.orderId } });
  } catch (e) {
    notification.error({
      text: t("pages.account.quote_details.error.approve"),
    });
  }
}

async function decline() {
  try {
    await declineItem(quote.value!.id);
    await fetchQuote({ id: props.quoteId });
  } catch (e) {
    notification.error({
      text: t("pages.account.quote_details.error.decline"),
    });
  }
}

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

watchEffect(async () => {
  clearQuote();
  await fetchQuote({ id: props.quoteId });
});

function getFile(attachment: QuoteAttachmentType): IAttachedFile {
  return {
    status: "attached",
    url: attachment.url,
    name: attachment.name,
    contentType: attachment.contentType,
    size: attachment.size,
  };
}
</script>
