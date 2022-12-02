<template>
  <div class="!gap-y-4" v-if="quote">
    <div class="space-y-3 px-6 md:px-0">
      <VcBreadcrumbs :items="breadcrumbs" class="lg:hidden" />

      <h2 class="text-26 tracking-wide font-bold uppercase">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <div class="">
      <!-- Quote comment -->
      <VcSection>
        <template #title>
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <VcImage
              :alt="$t('pages.account.quote_details.remarks')"
              src="/static/images/remarks.svg"
              class="w-11 h-11 -ml-0.5"
              lazy
            />
            <h3 class="text-gray-800 text-xl font-bold uppercase">
              {{ $t("pages.account.quote_details.remarks") }}
            </h3>
          </div>
        </template>

        <div class="mx-6 pb-1">
          <div class="text-base leading-5 font-bold">
            {{ $t("pages.account.quote_details.remarks_field_label") }}
          </div>
          <VcTextArea
            v-model="quote.comment"
            :isDisabled="fetching"
            :max-length="1000"
            :rows="7"
            class="mt-2 py-2 px-3 text-15 leading-5 font-medium resize-none"
            counter
          />
        </div>
      </VcSection>

      <!-- Quote products -->
      <VcSection>
        <template #title>
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <VcImage
              :alt="$t('pages.account.quote_details.products')"
              src="/static/images/products.svg"
              class="w-11 h-11 -ml-0.5"
              lazy
            />
            <h3 class="text-gray-800 text-xl font-bold uppercase">
              {{ $t("pages.account.quote_details.products") }}
            </h3>
          </div>
        </template>
        <div class="flex flex-col gap-6 px-6">
          <VcLineItem v-for="item in quote.items" :item="item" />
        </div>
      </VcSection>

      <!-- Quote shipping address -->
      <VcSection>
        <template #title>
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <VcImage
              :alt="$t('pages.account.quote_details.shipping_address')"
              src="/static/images/shipping-address.svg"
              class="w-11 h-11 -ml-0.5"
              lazy
            />
            <h3 class="text-gray-800 text-xl font-bold uppercase">
              {{ $t("pages.account.quote_details.shipping_address") }}
            </h3>
          </div>
        </template>

        <div class="mx-7">
          <h4 class="text-gray-800 text-md font-bold">
            {{ $t("pages.account.quote_details.shipping_address") }}
          </h4>
          <div class="border rounded mt-2.5 p-5">
            <div class="flex flex-wrap">
              <div class="lg:flex-col lg:w-1/2">
                <div v-if="shippingAddress">
                  <VcAddressInfo :address="shippingAddress" />
                </div>
                <div v-else>
                  <VcAlert type="warning" icon="fas fa-exclamation-triangle text-2xl">
                    {{ $t("pages.account.quote_details.no_address_message") }}
                  </VcAlert>
                </div>
              </div>
              <div class="lg:flex-col w-full lg:w-1/2 mt-2.5 lg:mt-0">
                <div class="flex justify-end">
                  <button
                    :disabled="fetching"
                    type="button"
                    class="h-7 w-7 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                    @click="
                      userHasAddresses
                        ? openAddressSelectionDialog(AddressType.Shipping)
                        : openAddOrUpdateAddressDialog(AddressType.Shipping, shippingAddress)
                    "
                    :title="$t('pages.account.addresses.edit_label')"
                  >
                    <i class="fas fa-pencil-alt" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VcSection>

      <!-- Quote billing address -->
      <VcSection>
        <template #title>
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <VcImage
              :alt="$t('pages.account.quote_details.billing_address')"
              src="/static/images/billing-address.svg"
              class="w-11 h-11 -ml-0.5"
              lazy
            />
            <h3 class="text-gray-800 text-xl font-bold uppercase">
              {{ $t("pages.account.quote_details.billing_address") }}
            </h3>
          </div>
        </template>

        <div class="mx-7 mb-5">
          <h4 class="text-gray-800 text-md font-bold">
            {{ $t("pages.account.quote_details.billing_address") }}
          </h4>
          <div class="border rounded mt-2.5 p-5">
            <div>
              <VcCheckbox
                :model-value="billingAndShippingAddressesAreEqual"
                :disabled="fetching"
                @change="toggleBillingAddressEqualShipping"
              >
                {{ $t("pages.account.quote_details.same_as_shipping_address") }}
              </VcCheckbox>
            </div>

            <div class="flex flex-wrap mt-5" v-if="!billingAndShippingAddressesAreEqual">
              <div class="lg:flex-col lg:w-1/2">
                <div v-if="billingAddress">
                  <VcAddressInfo :address="billingAddress" />
                </div>
                <div v-else>
                  <VcAlert type="warning" icon="fas fa-exclamation-triangle text-2xl">
                    {{ $t("pages.account.quote_details.no_address_message") }}
                  </VcAlert>
                </div>
              </div>
              <div class="lg:flex-col w-full lg:w-1/2 mt-2.5 lg:mt-0">
                <div class="flex justify-end">
                  <button
                    :disabled="fetching"
                    type="button"
                    class="h-7 w-7 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                    @click="
                      userHasAddresses
                        ? openAddressSelectionDialog(AddressType.Billing)
                        : openAddOrUpdateAddressDialog(AddressType.Billing, billingAddress)
                    "
                    :title="$t('pages.account.addresses.edit_label')"
                  >
                    <i class="fas fa-pencil-alt" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex w-full gap-x-5 px-7 py-5 justify-center lg:justify-end">
          <VcButton
            :isDisabled="!quoteChanged || fetching"
            size="lg"
            class="w-48 uppercase font-bold"
            is-outline
            @click="saveChanges"
          >
            {{ $t("pages.account.quote_details.save_changes") }}
          </VcButton>
          <VcButton :is-disabled="!quoteValid || fetching" size="lg" class="w-48 uppercase font-bold" @click="submit">
            {{ $t("pages.account.quote_details.submit") }}
          </VcButton>
        </div>
      </VcSection>
    </div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { computedEager } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { cloneDeep, isEqual } from "lodash";
import { QuoteAddressType, QuoteType } from "@/xapi";
import { AddressType } from "@/core";
import { useUser, useUserAddresses, useUserQuote } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateAddressDialog, SelectAddressDialog } from "@/shared/checkout";

const props = defineProps({
  quoteId: String,
});

const router = useRouter();
const { t } = useI18n();
const { user } = useUser();
const { addresses, fetchAddresses } = useUserAddresses({ user });
const { quote, billingAddress, shippingAddress, fetching, fetchQuote, changeComment, updateAddresses, submitQuote } =
  useUserQuote();
const { openPopup, closePopup } = usePopup();

const billingAndShippingAddressesAreEqual = ref<boolean>(true);
const originalQuote = ref<QuoteType>();
const originalBillingAddress = ref<QuoteAddressType>();
const originalShippingAddress = ref<QuoteAddressType>();

const userHasAddresses = computedEager<boolean>(() => !!addresses.value.length);

const commentChanged = computed<boolean>(() => !isEqual(quote.value?.comment, originalQuote.value?.comment));
const billingAddressChanged = computed<boolean>(() => !isEqual(billingAddress.value, originalBillingAddress.value));
const shippingAddressChanged = computed<boolean>(() => !isEqual(shippingAddress.value, originalShippingAddress.value));
const quoteChanged = computed<boolean>(
  () => commentChanged.value || billingAddressChanged.value || shippingAddressChanged.value
);
const quoteValid = computed<boolean>(() => !!shippingAddress.value && !!billingAddress.value);
const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

function toggleBillingAddressEqualShipping(): void {
  billingAndShippingAddressesAreEqual.value = !billingAndShippingAddressesAreEqual.value;
  if (billingAndShippingAddressesAreEqual.value && shippingAddress.value) {
    billingAddress.value = cloneDeep(shippingAddress.value);
    billingAddress.value!.addressType = AddressType.Billing;
    setQuoteAddress(billingAddress.value);
  }
}

function setQuoteAddress(address: QuoteAddressType): void {
  if (address.addressType === AddressType.Billing) {
    billingAddress.value = address;
  }
  if (address.addressType === AddressType.Shipping) {
    shippingAddress.value = address;
  }

  if (billingAndShippingAddressesAreEqual.value && shippingAddress.value) {
    billingAddress.value = cloneDeep(shippingAddress.value);
    billingAddress.value!.addressType = AddressType.Billing;
  }
}

function setInitialState(): void {
  originalQuote.value = cloneDeep(quote.value);
  originalBillingAddress.value = cloneDeep(billingAddress.value);
  originalShippingAddress.value = cloneDeep(shippingAddress.value);
  billingAndShippingAddressesAreEqual.value = isEqual(billingAddress.value, shippingAddress.value);
}

function openAddressSelectionDialog(addressType: AddressType.Billing | AddressType.Shipping): void {
  openPopup({
    component: SelectAddressDialog,
    props: {
      addresses: addresses.value,
      currentAddress: addressType === AddressType.Shipping ? shippingAddress.value : billingAddress.value,

      onResult(selectedAddress: QuoteAddressType) {
        const newAddress = cloneDeep(selectedAddress);
        newAddress.addressType = addressType;
        setQuoteAddress(newAddress);
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
  address?: QuoteAddressType
): void {
  const emptyAddress: QuoteAddressType = {
    city: "",
    countryName: "",
    firstName: "",
    lastName: "",
    addressType,
  };

  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address: address || emptyAddress,

      onResult(updatedAddress: QuoteAddressType) {
        const newAddress = cloneDeep(updatedAddress);
        newAddress.addressType = addressType;
        setQuoteAddress(updatedAddress);
        closePopup();
      },
    },
  });
}

async function saveChanges(): Promise<void> {
  let funcArray: Promise<void>[] = [];
  const addressesArray: QuoteAddressType[] = [];

  if (quote.value!.comment && commentChanged.value) {
    funcArray.push(changeComment(quote.value!.id, quote.value!.comment));
  }

  if (billingAddress.value) {
    addressesArray.push(billingAddress.value);
  }
  if (shippingAddress.value) {
    addressesArray.push(shippingAddress.value);
  }
  if (addressesArray.length) {
    funcArray = funcArray.concat(updateAddresses(quote.value!.id, addressesArray));
  }

  await Promise.all(funcArray);
  await fetchQuote({ id: props.quoteId });

  setInitialState();
}

async function submit(): Promise<void> {
  if (quoteValid.value) {
    await saveChanges();
    await submitQuote(quote.value!.id, quote.value!.comment || "");

    router.push({ name: "Quotes" });
  }
}

onMounted(async () => {
  await fetchAddresses();
  await fetchQuote({ id: props.quoteId });

  setInitialState();
});
</script>
