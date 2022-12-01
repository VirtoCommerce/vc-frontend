<template>
  <div v-if="quote">
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <!-- Quote comment -->
    <VcSection>
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
        <strong>
          {{ $t("pages.account.quote_details.remarks_field_label") }}
        </strong>
        <VcTextArea v-model="quote.comment" :max-length="1000" :rows="4" class="resize-none" counter />
      </div>
    </VcSection>

    <!-- Quote products -->
    <VcSection>
      <template #title>
        <div class="flex items-center px-7 py-5">
          <VcImage
            :alt="$t('pages.account.quote_details.products')"
            src="/static/images/products.svg"
            class="mr-4"
            lazy
          />
          <h3 class="text-gray-800 text-xl font-bold uppercase">
            {{ $t("pages.account.quote_details.products") }}
          </h3>
        </div>
      </template>
    </VcSection>

    <!-- Quote shipping address -->
    <VcSection>
      <template #title>
        <div class="flex items-center px-7 py-5">
          <VcImage
            :alt="$t('pages.account.quote_details.shipping_address')"
            src="/static/images/shipping-address.svg"
            class="mr-4"
            lazy
          />
          <h3 class="text-gray-800 text-xl font-bold uppercase">
            {{ $t("pages.account.quote_details.shipping_address") }}
          </h3>
        </div>
      </template>

      <div class="mx-7 mb-5">
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
                  type="button"
                  class="h-7 w-7 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                  @click="
                    openAddOrUpdateAddressDialog(
                      shippingAddress || { ...newAddress, addressType: AddressType.Shipping }
                    )
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
        <div class="flex items-center px-7 py-5">
          <VcImage
            :alt="$t('pages.account.quote_details.billing_address')"
            src="/static/images/billing-address.svg"
            class="mr-4"
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
            <VcCheckbox :model-value="billingAndShippingAddressesAreEqual" @change="toggleBillingAddressEqualShipping">
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
                  type="button"
                  class="h-7 w-7 shadow rounded text-[color:var(--color-primary)] hover:bg-gray-100"
                  @click="
                    openAddOrUpdateAddressDialog(billingAddress || { ...newAddress, addressType: AddressType.Billing })
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
        <VcButton size="lg" class="w-48 uppercase font-bold" is-outline>
          {{ $t("pages.account.quote_details.save_changes") }}
        </VcButton>
        <VcButton size="lg" class="w-48 uppercase font-bold">
          {{ $t("pages.account.quote_details.submit") }}
        </VcButton>
      </div>
    </VcSection>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { QuoteAddressType } from "@/xapi";
import { AddressType } from "@/core";
import { useUserQuote } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateAddressDialog } from "@/shared/checkout";

const props = defineProps({
  quoteId: String,
});

const { t } = useI18n();
const { quote, shippingAddress, billingAddress, billingAndShippingAddressesAreEqual, fetchQuote } = useUserQuote();
const { openPopup, closePopup } = usePopup();

const newAddress: Ref<QuoteAddressType> = ref({
  firstName: "",
  lastName: "",
  countryName: "",
  city: "",
});

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

function toggleBillingAddressEqualShipping(): void {
  billingAndShippingAddressesAreEqual.value = !billingAndShippingAddressesAreEqual.value;
  if (billingAndShippingAddressesAreEqual.value && shippingAddress.value) {
    copyBillingAddressFromShippingAddress();
  }
}

function openAddOrUpdateAddressDialog(address: QuoteAddressType): void {
  openPopup({
    component: AddOrUpdateAddressDialog,
    props: {
      address,
      async onResult(updatedAddress: QuoteAddressType) {
        closePopup();
        if (updatedAddress.addressType == AddressType.Shipping) {
          shippingAddress.value = updatedAddress;
        }
        if (updatedAddress.addressType == AddressType.Billing) {
          billingAddress.value = updatedAddress;
        }
        if (billingAndShippingAddressesAreEqual.value) {
          copyBillingAddressFromShippingAddress();
        }
      },
    },
  });
}

function copyBillingAddressFromShippingAddress(): void {
  billingAddress.value = shippingAddress.value;
  billingAddress.value!.addressType = AddressType.Billing;
}

watchEffect(() => {
  fetchQuote({ id: props.quoteId });
});
</script>
