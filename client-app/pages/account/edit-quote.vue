<template>
  <div class="!gap-y-4 lg:!gap-y-6" v-if="quote">
    <div class="flex flex-col gap-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-26 tracking-wide font-bold uppercase lg:text-3xl lg:leading-8">
        {{ $t("pages.account.quote_details.title", [quote!.number]) }}
      </h2>
    </div>

    <div class="-mx-5 bg-white shadow-md-x border-y lg:mx-0 lg:shadow-none lg:border-0 lg:bg-transparent lg:space-y-6">
      <!-- Quote comment -->
      <VcSectionWidget
        :title="$t('pages.account.quote_details.remarks')"
        icon="document-text"
        content-classes="px-6 pb-1 pt-2 lg:px-7 lg:pb-2"
      >
        <VcTextarea
          :label="$t('pages.account.quote_details.remarks_field_label')"
          v-model="quote.comment"
          :disabled="fetching"
          :max-length="1000"
          :rows="4"
          no-resize
          counter
        />
      </VcSectionWidget>

      <!-- Quote products -->
      <VcSectionWidget
        :title="$t('pages.account.quote_details.products')"
        icon="cube"
        content-classes="px-6 pt-3 pb-0 md:pb-7 md:px-7"
      >
        <QuoteLineItems :items="quote.items!" @remove:item="onRemoveItem" />
      </VcSectionWidget>

      <VcSectionWidget :title="$t('pages.account.quote_details.shipping_address')" icon="truck">
        <h4 class="text-md leading-5 font-bold">
          {{ $t("pages.account.quote_details.shipping_address") }}
        </h4>

        <div class="flex flex-col gap-3 border rounded mt-2 p-5 md:flex-row md:items-center empty:hidden">
          <VcAddressInfo class="grow text-15" v-if="shippingAddress" :address="shippingAddress" />

          <VcAlert v-else class="grow" type="warning" icon>
            {{ $t("pages.account.quote_details.no_address_message") }}
          </VcAlert>

          <div class="flex justify-end">
            <button
              :disabled="fetching"
              type="button"
              class="shrink-0 flex items-center justify-center h-9 w-9 rounded border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white"
              @click="
                userHasAddresses
                  ? openAddressSelectionDialog(AddressType.Shipping)
                  : openAddOrUpdateAddressDialog(AddressType.Shipping, shippingAddress)
              "
              :title="$t('pages.account.addresses.edit_label')"
            >
              <i class="fas fa-pencil-alt text-18" />
            </button>
          </div>
        </div>
      </VcSectionWidget>

      <!-- Quote billing address -->
      <VcSectionWidget :title="$t('pages.account.quote_details.billing_address')" icon="cash">
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.billing_address") }}
        </h4>

        <div class="border rounded mt-2.5 p-5">
          <VcCheckbox
            :model-value="billingAddressEqualsShippingAddress"
            :disabled="fetching"
            @change="toggleBillingAddressEqualsShippingAddress"
          >
            {{ $t("pages.account.quote_details.same_as_shipping_address") }}
          </VcCheckbox>

          <div
            class="flex flex-col gap-3 mt-4 md:flex-row md:items-center empty:hidden"
            v-if="!billingAddressEqualsShippingAddress"
          >
            <VcAddressInfo class="grow text-15" v-if="billingAddress" :address="billingAddress" />

            <VcAlert class="grow" type="warning" icon v-else>
              {{ $t("pages.account.quote_details.no_address_message") }}
            </VcAlert>

            <div class="flex justify-end">
              <button
                :disabled="fetching"
                type="button"
                class="shrink-0 flex items-center justify-center h-9 w-9 rounded border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white"
                @click="
                  userHasAddresses
                    ? openAddressSelectionDialog(AddressType.Billing)
                    : openAddOrUpdateAddressDialog(AddressType.Billing, billingAddress)
                "
                :title="$t('pages.account.addresses.edit_label')"
              >
                <i class="fas fa-pencil-alt text-18" />
              </button>
            </div>
          </div>
        </div>
      </VcSectionWidget>

      <div class="flex flex-wrap gap-5 px-6 py-7 lg:justify-end lg:p-0">
        <VcButton
          :is-disabled="!quoteChanged || !quoteItemsValid || fetching"
          size="lg"
          class="flex-1 p-2 uppercase font-bold lg:flex-none lg:min-w-[208px]"
          is-outline
          @click="saveChanges"
        >
          {{ $t("pages.account.quote_details.save_changes") }}
        </VcButton>

        <VcButton
          :is-disabled="!quoteValid || fetching"
          size="lg"
          class="flex-1 p-2 uppercase font-bold lg:flex-none lg:min-w-[208px]"
          @click="submit"
        >
          {{ $t("pages.account.quote_details.submit") }}
        </VcButton>
      </div>
    </div>
  </div>

  <VcLoaderOverlay no-bg v-else />
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { computedEager } from "@vueuse/core";
import { cloneDeep, isEqual, remove, every } from "lodash";
import { MemberAddressType, QuoteAddressType, QuoteItemType, QuoteType } from "@/xapi";
import { AddressType, convertToType } from "@/core";
import { useUserAddresses, useUserQuote, QuoteLineItems } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateAddressModal, SelectAddressModal } from "@/shared/checkout";
import { usePageHead } from "@/core/composables";
import { asyncForEach } from "@/core/utilities";

const props = defineProps({
  quoteId: {
    type: String,
  },
});

const router = useRouter();
const { t } = useI18n();
const { openPopup, closePopup } = usePopup();
const { addresses, fetchAddresses, addOrUpdateAddresses } = useUserAddresses();
const {
  fetching,
  quote,
  shippingAddress,
  billingAddress,
  clearQuote,
  setQuoteAddress,
  fetchQuote,
  changeComment,
  changeItemQuantity,
  updateAddresses,
  removeItem,
  submitQuote,
} = useUserQuote();

usePageHead({
  title: t("pages.account.quote_details.title", [quote!.value?.number]),
});

const originalQuote = ref<QuoteType | undefined>();
const billingAddressEqualsShippingAddress = ref<boolean>(true);

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);
const quoteChanged = computed<boolean>(() => !isEqual(originalQuote.value, quote.value));
const quoteItemsValid = computed<boolean>(() =>
  every(quote.value?.items, (item: QuoteItemType) => item.selectedTierPrice?.quantity > 0)
);
const quoteValid = computed<boolean>(
  () =>
    !!shippingAddress.value &&
    (!!billingAddress.value || billingAddressEqualsShippingAddress.value) &&
    quoteItemsValid.value
);

const userHasAddresses = computedEager<boolean>(() => !!addresses.value.length);

function onRemoveItem(item: QuoteItemType): void {
  remove(quote.value!.items!, (i: QuoteItemType) => i.id === item.id);
}

function toggleBillingAddressEqualsShippingAddress(): void {
  billingAddressEqualsShippingAddress.value = !billingAddressEqualsShippingAddress.value;
}

function setBillingAddressEqualsShippingAddress(): void {
  const newBillingAddress = cloneDeep(shippingAddress.value!);
  newBillingAddress.key = undefined;
  newBillingAddress.addressType = AddressType.Billing;
  setQuoteAddress(newBillingAddress);
}

function openAddressSelectionDialog(addressType: AddressType.Billing | AddressType.Shipping): void {
  openPopup({
    component: SelectAddressModal,
    props: {
      addresses: addresses.value,
      currentAddress: convertToType<MemberAddressType>(
        addressType === AddressType.Billing ? billingAddress.value : shippingAddress.value
      ),

      onResult(selectedAddress: MemberAddressType): void {
        const quoteAddress = convertToType<QuoteAddressType>({ ...selectedAddress, addressType });

        setQuoteAddress(quoteAddress);
        closePopup();
      },

      onAddNewAddress() {
        setTimeout(() => {
          openAddOrUpdateAddressDialog(addressType);
        }, 500);
      },
    },
  });
}

function openAddOrUpdateAddressDialog(
  addressType: AddressType.Billing | AddressType.Shipping,
  currentAddress?: QuoteAddressType
): void {
  openPopup({
    component: AddOrUpdateAddressModal,
    props: {
      address: currentAddress,

      async onResult(updatedAddress: MemberAddressType): Promise<void> {
        const quoteAddress = convertToType<QuoteAddressType>({ ...updatedAddress, addressType });

        setQuoteAddress(quoteAddress);
        closePopup();

        // Save address in account
        await addOrUpdateAddresses([{ ...updatedAddress, addressType: AddressType.BillingAndShipping }]);
      },
    },
  });
}

// Due API concurrency errors each query will be sended consecutively
async function saveChanges(): Promise<void> {
  if (originalQuote.value?.comment !== quote.value?.comment) {
    await changeComment(quote.value!.id, quote.value!.comment!);
  }

  await asyncForEach(originalQuote.value!.items!, async (originalItem: QuoteItemType) => {
    const quoteItem: QuoteItemType | undefined = quote.value!.items?.find(
      (item: QuoteItemType) => item.id === originalItem.id
    );
    if (quoteItem) {
      if (quoteItem.selectedTierPrice!.quantity !== originalItem.selectedTierPrice!.quantity) {
        await changeItemQuantity(quote.value!.id, quoteItem.id, quoteItem.selectedTierPrice!.quantity);
      }
    } else {
      await removeItem(quote.value!.id, originalItem.id);
    }
  });

  if (quote.value!.addresses?.length && !isEqual(quote.value!.addresses, originalQuote.value!.addresses)) {
    if (billingAddressEqualsShippingAddress.value) {
      setBillingAddressEqualsShippingAddress();
    }
    await updateAddresses(quote.value!.id, quote.value!.addresses);
  }

  await fetchQuote({ id: props.quoteId });

  originalQuote.value = cloneDeep(quote.value);
}

async function submit(): Promise<void> {
  if (quoteChanged.value) {
    await saveChanges();
  }

  await submitQuote(quote.value!.id, quote.value!.comment || "");

  router.replace({ name: "Quotes" });
}

onMounted(() => {
  if (quote.value && quote.value.status !== "Draft") {
    router.replace({ name: "ViewQuote", params: { quoteId: quote.value.id } });
  }
});

watchEffect(async () => {
  clearQuote();

  await fetchAddresses();
  await fetchQuote({ id: props.quoteId });

  originalQuote.value = cloneDeep(quote.value);
});
</script>
