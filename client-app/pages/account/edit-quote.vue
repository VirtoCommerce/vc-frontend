<template>
  <div class="!gap-y-4 lg:!gap-y-6" v-if="quote">
    <div class="flex flex-col gap-3 px-6 lg:px-0">
      <VcBreadcrumbs :items="breadcrumbs" class="lg:hidden" />

      <h2 class="text-26 tracking-wide font-bold uppercase lg:text-3xl lg:leading-8">
        {{ $t("pages.account.quote_details.title", [quote?.number]) }}
      </h2>
    </div>

    <div class="bg-white shadow-md-x border-y lg:shadow-none lg:border-0 lg:bg-transparent lg:space-y-6">
      <!-- Quote comment -->
      <VcSectionWidget
        :title="$t('pages.account.quote_details.remarks')"
        icon-url="/static/images/remarks.svg"
        content-classes="px-6 pb-1 pt-4 lg:px-7 lg:pb-2"
      >
        <div class="text-base leading-5 font-bold lg:text-15">
          {{ $t("pages.account.quote_details.remarks_field_label") }}
        </div>
        <VcTextArea
          v-model="quote.comment"
          :is-disabled="fetching"
          :max-length="1000"
          :rows="4"
          class="mt-2 py-2 px-3 text-15 leading-5 font-medium resize-none lg:mt-1"
          counter
        />
      </VcSectionWidget>

      <!-- Quote products -->
      <VcSectionWidget :title="$t('pages.account.quote_details.products')" icon-url="/static/images/products.svg">
        <QuoteLineItems :items="quote.items!" @removeItem="removeItem" />
      </VcSectionWidget>

      <!-- Quote shipping address -->
      <VcSectionWidget
        :title="$t('pages.account.quote_details.shipping_address')"
        icon-url="/static/images/shipping-address.svg"
      >
        <h4 class="text-md leading-5 font-bold">
          {{ $t("pages.account.quote_details.shipping_address") }}
        </h4>
        <div class="flex flex-col gap-3 border rounded mt-2 p-5 md:flex-row md:items-center empty:hidden">
          <div class="grow text-15" v-if="shippingAddress">
            <VcAddressInfo :address="shippingAddress" />
          </div>
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
      <VcSectionWidget
        :title="$t('pages.account.quote_details.billing_address')"
        icon-url="/static/images/billing-address.svg"
      >
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.billing_address") }}
        </h4>
        <div class="border rounded mt-2.5 p-5">
          <VcCheckbox
            :model-value="billingAndShippingAddressesAreEqual"
            :disabled="fetching"
            @change="toggleBillingAddressEqualShipping"
          >
            {{ $t("pages.account.quote_details.same_as_shipping_address") }}
          </VcCheckbox>

          <div
            class="flex flex-col gap-3 mt-4 md:flex-row md:items-center empty:hidden"
            v-if="!billingAndShippingAddressesAreEqual"
          >
            <div class="grow text-15" v-if="billingAddress">
              <VcAddressInfo :address="billingAddress" />
            </div>
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
          :is-disabled="!quoteChanged || fetching"
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

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { computedEager } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { cloneDeep, isEqual } from "lodash";
import { MemberAddressType, QuoteAddressType, QuoteItemType, QuoteType } from "@/xapi";
import { AddressType } from "@/core";
import { useUser, useUserAddresses, useUserQuote, QuoteLineItems } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateAddressDialog, SelectAddressDialog } from "@/shared/checkout";

const props = defineProps({
  quoteId: String,
});

const router = useRouter();
const { t } = useI18n();
const { user } = useUser();
const { addresses, fetchAddresses, addOrUpdateAddresses } = useUserAddresses({ user });
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

      async onResult(updatedAddress: QuoteAddressType) {
        const newAddress = cloneDeep(updatedAddress);
        newAddress.addressType = addressType;
        setQuoteAddress(updatedAddress);

        await addOrUpdateAddresses([newAddress as MemberAddressType], user.value.memberId);

        closePopup();
      },
    },
  });
}

async function removeItem(item: QuoteItemType): Promise<void> {
  console.log(item);
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

  if (quote.value!.status !== "Draft") {
    router.push({ name: "ViewQuote", params: { quoteId: quote.value!.id } });
  }

  setInitialState();
});
</script>
