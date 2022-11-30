<template>
  <div v-if="quote">
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <!-- Quote comment -->
    <VcSection :title="$t('pages.account.quote_details.remarks')" icon-url="/static/images/remarks.svg" class="shadow">
      <div class="mx-6 mb-6">
        <strong>
          {{ $t("pages.account.quote_details.remarks_field_label") }}
        </strong>
        <VcTextArea v-model="comment" :max-length="1000" :rows="4" class="resize-none" />
      </div>
    </VcSection>

    <!-- Quote items -->
    <VcSection
      :title="$t('pages.account.quote_details.products')"
      icon-url="/static/images/products.svg"
      class="shadow"
    >
      <div class="mx-6 mb-6">
        <VcLineItems :columns="columns">
          <VcLineItem v-for="item in quote.items" :key="item?.id" :item="item" @removeItem="removeItem">
            <template #pricePerItem>
              <VcPriceDisplay :value="item.selectedTierPrice?.price" />
            </template>

            <template #quantity>
              <input
                v-model="item.selectedTierPrice!.quantity"
                type="number"
                pattern="\d*"
                class="border rounded outline-none p-1 text-center focus:border-gray-300 w-[5.625rem] h-[32px] md:w-1/3 lg:h-10"
                :disabled="!item.product"
              />

              <VcInStock
                :quantity="item.product?.availabilityData?.availableQuantity"
                :is-in-stock="!!item.product && item.product.availabilityData?.isInStock"
                class="mt-2 w-1/2"
                v-if="!!item.product"
              />
            </template>

            <template #total>
              <span>
                {{ $n(item.selectedTierPrice!.price!.amount * item.selectedTierPrice!.quantity, "currency") }}
              </span>
            </template>
          </VcLineItem>

          <div class="md:table-row font-bold text-15 text-[color:var(--color-success)] text-right">
            <span class="mr-2">{{ $t("common.labels.subtotal") }}:</span>
            <VcPriceDisplay :value="quote.totals?.grandTotalInclTax" class="text-lg font-extrabold" />
          </div>
        </VcLineItems>
      </div>
    </VcSection>

    <!-- Quote shipping address -->
    <VcSection>
      <template #title>
        <div class="flex space-between px-5 py-7">
          <div class="flex">
            <VcImage
              src="/static/images/shipping-address.svg"
              :alt="$t('pages.account.quote_details.shipping_address')"
              class="mr-5 lg:mr-8"
              lazy
            />
            <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">
              {{ $t("pages.account.quote_details.shipping_address") }}
            </h3>
          </div>

          <div class="flex-1 text-right">
            <VcButton
              size="lg"
              class="w-48 uppercase font-bold"
              is-outline
              @click="openAddOrUpdateAddressDialog({ ...newAddress, addressType: AddressType.Shipping })"
            >
              {{ $t("pages.account.addresses.new_address_title") }}
            </VcButton>
          </div>
        </div>
      </template>

      <div class="mx-6 mb-6 p-4 border rounded" v-if="shippingAddress">
        <div class="flex space-between">
          <div class="flex-1">
            <div class="font-bold">{{ shippingAddress.firstName }} {{ shippingAddress.lastName }}</div>
            <div>
              {{ shippingAddress.line1 }}, {{ shippingAddress.countryName }}, {{ shippingAddress.regionName }}
              {{ shippingAddress.postalCode }}
            </div>
            <div v-if="shippingAddress.phone">
              <span class="mr-2 font-bold">{{ $t("common.labels.phone") }}</span>
              <span>{{ shippingAddress.phone }}</span>
            </div>
            <div v-if="shippingAddress.email">
              <span class="mr-2 font-bold">{{ $t("common.labels.email") }}</span>
              <span>{{ shippingAddress.email }}</span>
            </div>
          </div>

          <div class="flex-1 align-middle justify-end">
            <button
              type="button"
              class="h-7 w-7 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
              @click="openAddOrUpdateAddressDialog(shippingAddress!)"
              :title="$t('pages.account.addresses.edit_label')"
            >
              <i class="fas fa-pencil-alt" />
            </button>
          </div>
        </div>
      </div>
    </VcSection>

    <!-- Quote billing address -->
    <VcSection
      :title="$t('pages.account.quote_details.billing_address')"
      icon-url="/static/images/billing-address.svg"
      class="shadow"
    >
      <div class="mx-6 mb-6"></div>
    </VcSection>

    <VcButton size="lg" class="w-48 uppercase font-bold" is-outline :is-disabled="!quoteChanged" @click="saveChanges">
      {{ $t("common.buttons.save_changes") }}
    </VcButton>

    <VcButton size="lg" class="w-48 uppercase font-bold" v-if="quote.status === 'Processing'">
      {{ $t("common.buttons.submit") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useUserQuote } from "@/shared/account";
import { VcLineItem, VcPriceDisplay } from "@/ui-kit/components";
import { clone, remove, filter, forEach, isEqual } from "lodash";
import { QuoteAddressType, QuoteItemType } from "@/xapi";
import { AddressType } from "@/core";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateAddressDialog } from "@/shared/checkout";

const props = defineProps({
  quoteId: String,
});

const { t } = useI18n();
const {
  quote,
  shippingAddress,
  fetchQuote,
  updateQuoteComment,
  updateQuoteItemQuantity,
  removeQuoteItem,
  updateQuoteAddresses,
} = useUserQuote();
const { openPopup, closePopup } = usePopup();

const originalQuote = ref(clone(quote.value));
const originalShippingAddress = ref(clone(shippingAddress.value));
const comment = ref("");
const changedLineItems = ref<QuoteItemType[]>([]);
const newAddress = ref<QuoteAddressType>({
  city: "",
  countryName: "",
  firstName: "",
  lastName: "",
});

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

const commentChanged = computed<boolean>(() => comment.value !== originalQuote.value?.comment);
const quoteChanged = computed<boolean>(() => commentChanged.value || !!changedLineItems.value.length);

const columns: ITableColumn[] = [
  {
    id: "product",
    title: t("shared.line_items.header.product"),
    classes: "border-b align-middle w-80",
  },
  {
    id: "properties",
    title: t("shared.line_items.header.properties"),
    classes: "border-b align-middle",
  },
  {
    id: "pricePerItem",
    title: t("shared.line_items.header.price_per_item"),
    classes: "border-b align-middle text-center",
  },
  {
    id: "quantity",
    title: t("shared.line_items.header.quantity"),
    classes: "border-b align-middle text-center",
  },
  {
    id: "total",
    title: t("shared.line_items.header.total"),
    classes: "border-b align-middle text-right",
  },
  {
    id: "remove",
    classes: "border-b align-middle",
  },
];

function removeItem(item: QuoteItemType): void {
  item.selectedTierPrice!.quantity = 0;
  remove(quote.value!.items!, (lineItem: QuoteItemType) => lineItem.id === item.id);
  changedLineItems.value.push(item);
}

function openAddOrUpdateAddressDialog(address: QuoteAddressType): void {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address,
      async onResult(updatedAddress: QuoteAddressType) {
        closePopup();
        shippingAddress.value = updatedAddress;
      },
    },
  });
}

async function saveChanges(): Promise<void> {
  const funcArray = [];

  if (commentChanged.value) {
    funcArray.push(updateQuoteComment(quote.value!.id, comment.value));
  }

  const itemsToRemove = filter(changedLineItems.value, (item: QuoteItemType) => item.selectedTierPrice!.quantity === 0);
  if (itemsToRemove.length) {
    forEach(itemsToRemove, (item: QuoteItemType) => {
      funcArray.push(removeQuoteItem(quote.value!.id, item.id));
    });
  }

  const itemsToChange = filter(changedLineItems.value, (item: QuoteItemType) => item.selectedTierPrice!.quantity !== 0);
  if (itemsToChange.length) {
    forEach(itemsToChange, (item: QuoteItemType) => {
      funcArray.push(updateQuoteItemQuantity(quote.value!.id, item.id, item.selectedTierPrice!.quantity));
    });
  }

  if (!isEqual(shippingAddress.value, originalShippingAddress.value)) {
    funcArray.push(updateQuoteAddresses(quote.value!.id, [shippingAddress.value!]));
  }

  await Promise.all(funcArray);

  originalQuote.value = clone(quote.value);
  changedLineItems.value = [];
}

watchEffect(() => {
  fetchQuote({ id: props.quoteId });
});
</script>
