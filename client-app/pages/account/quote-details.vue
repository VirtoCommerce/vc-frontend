<template>
  <div v-if="quote">
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <!-- Content Block -->
    <VcSection :title="$t('pages.account.quote_details.remarks')" icon-url="/static/images/remarks.svg" class="shadow">
      <div class="mx-6 mb-6">
        <strong>
          {{ $t("pages.account.quote_details.remarks_field_label") }}
        </strong>
        <VcTextArea v-model="comment" :max-length="1000" :rows="4" class="resize-none" />
      </div>
    </VcSection>

    <VcSection
      :title="$t('pages.account.quote_details.products')"
      icon-url="/static/images/products.svg"
      class="shadow"
    >
      <div class="mx-6 mb-6">
        <VcLineItem v-for="item in quoteItems" :key="item?.id" :item="item" />
      </div>
    </VcSection>

    <VcSection
      :title="$t('pages.account.quote_details.shipping_address')"
      icon-url="/static/images/shipping-address.svg"
      class="shadow"
    >
      <div class="mx-6 mb-6"></div>
    </VcSection>

    <VcSection
      :title="$t('pages.account.quote_details.billing_address')"
      icon-url="/static/images/billing-address.svg"
      class="shadow"
    >
      <div class="mx-6 mb-6"></div>
    </VcSection>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useUserQuote } from "@/shared/account";

const props = defineProps({
  quoteId: String,
});

const { t } = useI18n();
const { quote, itemsPerPage, fetchQuote } = useUserQuote();

const comment = ref("");
const page = ref(1);

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

const quoteItems = computed(() =>
  quote.value?.items?.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

watchEffect(() => {
  fetchQuote({ id: props.quoteId });
});
</script>
