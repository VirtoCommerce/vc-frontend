<template>
  <div v-if="quote" class="!gap-y-4 px-6 lg:!gap-y-6 lg:px-0">
    <div class="flex flex-col gap-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-26 font-bold uppercase tracking-wide lg:text-3xl lg:leading-8">
        {{ $t("pages.account.quote_details.title", [quote!.number]) }}
      </h2>
    </div>

    <div class="-mx-4.5 space-y-5 lg:mx-0 lg:space-y-6">
      <!-- Quote comment -->
      <VcWidget :title="$t('pages.account.quote_details.remarks')" prepend-icon="document-text" size="lg">
        <VcTextarea
          v-model.trim="comment"
          :label="$t('pages.account.quote_details.remarks_field_label')"
          :disabled="fetching"
          :max-length="1000"
          :rows="4"
          no-resize
          counter
        />
      </VcWidget>

      <!-- Quote products -->
      <VcWidget :title="$t('pages.account.quote_details.products')" prepend-icon="cube" size="lg">
        <QuoteLineItems :items="quote.items!" @remove:item="onRemoveItem" />
      </VcWidget>

      <VcWidget :title="$t('pages.account.quote_details.shipping_address')" prepend-icon="truck" size="lg">
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.shipping_address") }}
        </h4>

        <div :class="['mt-2.5 rounded border p-5', { 'cursor-not-allowed bg-[--color-neutral-50]': fetching }]">
          <VcAddressSelection
            :placeholder="$t('shared.checkout.shipping_details_section.links.select_address')"
            :address="shippingAddress"
            :disabled="fetching"
            @change="
              userHasAddresses
                ? openSelectAddressModal(AddressType.Shipping)
                : openAddOrUpdateAddressModal(AddressType.Shipping, shippingAddress)
            "
          />
        </div>
      </VcWidget>

      <!-- Quote billing address -->
      <VcWidget :title="$t('pages.account.quote_details.billing_address')" prepend-icon="cash" size="lg">
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.billing_address") }}
        </h4>

        <div
          :class="['mt-2.5 space-y-1.5 rounded border p-5', { 'cursor-not-allowed bg-[--color-neutral-50]': fetching }]"
        >
          <VcCheckbox
            :model-value="billingAddressEqualsShipping"
            :disabled="fetching || !shippingAddress"
            @change="toggleBillingAddressEqualsShippingAddress"
          >
            {{ $t("pages.account.quote_details.same_as_shipping_address") }}
          </VcCheckbox>

          <VcAddressSelection
            :placeholder="
              shippingAddress && billingAddressEqualsShipping
                ? $t('pages.account.quote_details.select_shipping_address')
                : $t('pages.account.quote_details.select_billing_address')
            "
            :address="billingAddressEqualsShipping ? shippingAddress : billingAddress"
            :readonly="billingAddressEqualsShipping"
            :disabled="fetching"
            class="min-h-[3.313rem]"
            @change="
              userHasAddresses
                ? openSelectAddressModal(AddressType.Billing)
                : openAddOrUpdateAddressModal(AddressType.Billing, billingAddress)
            "
          />
        </div>
      </VcWidget>
    </div>

    <div class="flex flex-wrap gap-5 py-7 lg:justify-end">
      <VcButton
        :disabled="!quoteChanged || fetching"
        class="flex-1 lg:min-w-[208px] lg:flex-none"
        variant="outline"
        @click="saveChanges"
      >
        {{ $t("pages.account.quote_details.save_changes") }}
      </VcButton>

      <VcButton :disabled="!quoteValid || fetching" class="flex-1 lg:min-w-[208px] lg:flex-none" @click="submit">
        {{ $t("pages.account.quote_details.submit") }}
      </VcButton>
    </div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { cloneDeep, every, isEqual, remove } from "lodash";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { AddressType } from "@/core/enums";
import { asyncForEach, convertToType, isEqualAddresses } from "@/core/utilities";
import { QuoteLineItems, useUser, useUserAddresses, useUserQuote } from "@/shared/account";
import { SelectAddressModal } from "@/shared/checkout";
import { useOrganizationAddresses } from "@/shared/company";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import type { MemberAddressType, QuoteAddressType, QuoteItemType, QuoteType } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

interface IProps {
  quoteId: string;
}

const props = defineProps<IProps>();

const router = useRouter();
const { t } = useI18n();
const { openPopup, closePopup } = usePopup();
const { user, isAuthenticated, isCorporateMember } = useUser();
const {
  addresses: personalAddresses,
  fetchAddresses: fetchPersonalAddresses,
  addOrUpdateAddresses: addOrUpdatePersonalAddresses,
} = useUserAddresses();
const {
  addresses: organizationsAddresses,
  fetchAddresses: fetchOrganizationAddresses,
  addOrUpdateAddresses: addOrUpdateOrganizationAddresses,
} = useOrganizationAddresses(user.value.contact?.organizationId || "");
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
const notifications = useNotifications();

usePageHead({
  title: t("pages.account.quote_details.title", [quote!.value?.number]),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.quote_requests"), route: { name: "Quotes" } },
  { title: t("pages.account.quote_details.title", [quote?.value?.number]) },
]);

const originalQuote = ref<QuoteType>();
const billingAddressEqualsShipping = ref<boolean>(true);
const comment = ref<string>();

const accountAddresses = computed<AnyAddressType[]>(() => {
  const { firstName, lastName } = user.value.contact ?? {};

  return isCorporateMember.value
    ? organizationsAddresses.value.map((address) => ({ ...address, firstName, lastName }))
    : personalAddresses.value;
});
const quoteChanged = computed<boolean>(
  () =>
    !isEqual(originalQuote.value, quote.value) ||
    originalQuote.value?.comment !== comment.value ||
    (!!shippingAddress.value && billingAddressEqualsShipping.value && !isBillingAddressEqualsShipping.value),
);
const quoteItemsValid = computed<boolean>(
  () =>
    !!quote.value?.items?.length &&
    every(
      quote.value?.items,
      (item: QuoteItemType) => !!item.selectedTierPrice?.quantity && item.selectedTierPrice.quantity > 0,
    ),
);
const quoteValid = computed<boolean>(
  () =>
    !!shippingAddress.value &&
    (!!billingAddress.value || billingAddressEqualsShipping.value) &&
    (!!comment.value || quoteItemsValid.value),
);

const userHasAddresses = computedEager<boolean>(() => !!accountAddresses.value.length);

const isBillingAddressEqualsShipping = computed<boolean>(() => {
  if (shippingAddress.value && billingAddress.value) {
    return isEqualAddresses(shippingAddress.value, billingAddress.value);
  } else if (shippingAddress.value && !billingAddress.value) {
    return true;
  }

  return false;
});

function accountAddressExists(address: AnyAddressType): boolean {
  return accountAddresses.value.some((item) => isEqualAddresses(item, address));
}

function onRemoveItem(item: QuoteItemType): void {
  remove(quote.value!.items!, (i: QuoteItemType) => i.id === item.id);
}

function toggleBillingAddressEqualsShippingAddress(): void {
  billingAddressEqualsShipping.value = !billingAddressEqualsShipping.value;
}

function setBillingAddressEqualsShippingAddress(): void {
  const newBillingAddress = cloneDeep(shippingAddress.value!);
  newBillingAddress.key = undefined;
  newBillingAddress.addressType = AddressType.Billing;
  setQuoteAddress(newBillingAddress);
}

function setBillingAddressEqualsShipping(): void {
  billingAddressEqualsShipping.value = isBillingAddressEqualsShipping.value;
}

function openAddOrUpdateAddressModal(addressType: AddressType, currentAddress?: QuoteAddressType): void {
  openPopup({
    component: AddOrUpdateAddressModal,
    props: {
      address: currentAddress,

      async onResult(updatedAddress: MemberAddressType): Promise<void> {
        const quoteAddress = convertToType<QuoteAddressType>({ ...updatedAddress, addressType });

        setQuoteAddress(quoteAddress);
        closePopup();

        // Save address in account
        const addressToSave = { ...updatedAddress, addressType: AddressType.BillingAndShipping };

        if (accountAddressExists(addressToSave)) {
          return;
        }

        if (isCorporateMember.value) {
          await addOrUpdateOrganizationAddresses([addressToSave]);
        } else {
          await addOrUpdatePersonalAddresses([addressToSave]);
        }

        setBillingAddressEqualsShipping();
      },
    },
  });
}

function openSelectAddressModal(addressType: AddressType): void {
  openPopup({
    component: SelectAddressModal,
    props: {
      addresses: accountAddresses.value,
      currentAddress: convertToType<MemberAddressType>(
        addressType === AddressType.Billing ? billingAddress.value : shippingAddress.value,
      ),
      isCorporateAddresses: isCorporateMember.value,

      onResult(selectedAddress: MemberAddressType): void {
        const quoteAddress = convertToType<QuoteAddressType>({ ...selectedAddress, addressType });

        setQuoteAddress(quoteAddress);
        setBillingAddressEqualsShipping();
        closePopup();
      },

      onAddNewAddress() {
        setTimeout(() => {
          openAddOrUpdateAddressModal(addressType);
        }, 500);
      },
    },
  });
}

// Due API concurrency errors each query will be sended consecutively
async function saveChanges(): Promise<void> {
  if (originalQuote.value?.comment !== comment.value) {
    await changeComment(quote.value!.id, comment.value!);
  }

  await asyncForEach(originalQuote.value!.items!, async (originalItem: QuoteItemType) => {
    const quoteItem: QuoteItemType | undefined = quote.value!.items?.find(
      (item: QuoteItemType) => item.id === originalItem.id,
    );
    if (quoteItem) {
      if (quoteItem.selectedTierPrice!.quantity !== originalItem.selectedTierPrice!.quantity) {
        await changeItemQuantity(quote.value!.id, quoteItem.id, quoteItem.selectedTierPrice!.quantity);
      }
    } else {
      await removeItem(quote.value!.id, originalItem.id);
    }
  });

  if (
    quote.value!.addresses?.length &&
    (!isEqual(quote.value!.addresses, originalQuote.value!.addresses) ||
      (billingAddressEqualsShipping.value && !isBillingAddressEqualsShipping.value))
  ) {
    if (billingAddressEqualsShipping.value) {
      setBillingAddressEqualsShippingAddress();
    }

    await updateAddresses(quote.value!.id, quote.value!.addresses);

    setBillingAddressEqualsShipping();
  }

  await fetchQuote({ id: props.quoteId });

  notifications.success({
    duration: DEFAULT_NOTIFICATION_DURATION,
    singleInGroup: true,
    html: t("pages.account.quote_details.save_changes_notification_success"),
  });

  originalQuote.value = cloneDeep(quote.value);
}

async function submit(): Promise<void> {
  if (quoteChanged.value) {
    await saveChanges();
  }

  await submitQuote(quote.value!.id, comment.value || "");

  router.replace({ name: "Quotes" });
}

async function fetchAddresses(): Promise<void> {
  if (!isAuthenticated.value) {
    return;
  }

  if (isCorporateMember.value) {
    await fetchOrganizationAddresses();
  } else {
    await fetchPersonalAddresses();
  }
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
  comment.value = quote.value?.comment;
  setBillingAddressEqualsShipping();
});
</script>
