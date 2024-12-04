<template>
  <div v-if="quote">
    <div class="space-y-3">
      <VcBreadcrumbs :items="breadcrumbs" />
    </div>

    <VcLayout sidebar-position="right">
      <VcTypography tag="h1">
        {{ $t("quote_details.title", [quote.number]) }}
      </VcTypography>

      <template #sidebar>
        <div v-if="quote.status === 'Proposal sent'" class="flex flex-wrap gap-3 max-md:mt-5">
          <VcButton class="grow" variant="outline" @click="decline">
            {{ $t("common.buttons.decline") }}
          </VcButton>
          <VcButton class="grow" @click="approve">
            {{ $t("common.buttons.approve") }}
          </VcButton>
        </div>
      </template>
    </VcLayout>

    <VcLayout sidebar-position="right">
      <!-- Quote products -->
      <VcWidget size="lg">
        <QuoteLineItems :items="quote.items" readonly />
      </VcWidget>

      <!-- Quote comment -->
      <VcWidget v-if="quote.comment" :title="$t('quote_details.comment')" prepend-icon="document-text" size="lg">
        <div class="text-base">
          {{ quote.comment }}
        </div>
      </VcWidget>

      <VcWidget
        v-if="quote.attachments?.length"
        :title="$t('quote_details.files')"
        size="lg"
        prepend-icon="document-text"
        class="mt-5"
      >
        <ul class="space-y-2 rounded border border-neutral-200 px-3 py-4">
          <li v-for="(attachment, index) in quote.attachments" :key="index">
            <VcFile :file="getFile(attachment)" @download="onDownload" />
          </li>
        </ul>
      </VcWidget>

      <template #sidebar>
        <QuoteSummary :quote="quote" class="mb-5 max-md:mt-5" />

        <VcWidget :title="$t('quote_details.quote_data')" class="mb-5 max-md:order-first">
          <div class="space-y-1">
            <div class="flex text-base">
              <span class="mr-2 font-bold">{{ $t("quote_details.created") }}:</span>

              <span>{{ $d(quote.createdDate) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-base font-bold">{{ $t("quote_details.status") }}:</span>

              <QuoteStatus class="min-w-[7.785rem]" :status="quote.status" />
            </div>
          </div>
        </VcWidget>

        <VcWidget v-if="shippingAddress" :title="$t('quote_details.shipping_address')" class="mb-5">
          <VcAddressInfo :address="shippingAddress!" />
        </VcWidget>

        <VcWidget v-if="billingAddress" :title="$t('quote_details.billing_address')">
          <VcAddressInfo :address="billingAddress!" />
        </VcWidget>
      </template>
    </VcLayout>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useUserQuote } from "@/modules/quotes/useUserQuote";
import { downloadFile } from "@/shared/files";
import { useNotifications } from "@/shared/notification";
import type { QuoteAttachmentType } from "@/modules/quotes/api/graphql/types";
import QuoteLineItems from "@/modules/quotes/components/quote-line-items.vue";
import QuoteStatus from "@/modules/quotes/components/quote-status.vue";
import QuoteSummary from "@/modules/quotes/components/quote-summary.vue";

interface IProps {
  quoteId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { quote, billingAddress, approveItem, declineItem, shippingAddress, fetchQuote } = useUserQuote();
const notification = useNotifications();
const router = useRouter();

usePageHead({
  title: t("quote_details.title", [quote!.value?.number]),
});

async function approve() {
  try {
    const result = await approveItem(quote.value!.id);
    await router.push({ name: "OrderDetails", params: { orderId: result.orderId } });
  } catch (e) {
    notification.error({
      text: t("quote_details.error.approve"),
    });
  }
}

async function decline() {
  try {
    await declineItem(quote.value!.id);
    await fetchQuote({ id: props.quoteId });
  } catch (e) {
    notification.error({
      text: t("quote_details.error.decline"),
    });
  }
}

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("quotes.navigation.route_name"), route: { name: "Quotes" } },
  { title: t("quote_details.title", [quote?.value?.number]) },
]);

watchEffect(async () => {
  await fetchQuote({ id: props.quoteId });
});

function getFile(attachment: QuoteAttachmentType): IAttachedFile {
  return {
    ...attachment,
    status: "attached",
  };
}

function onDownload(file: FileType) {
  void downloadFile(file.url!, file.name);
}
</script>
