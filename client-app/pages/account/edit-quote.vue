<template>
  <div v-if="quote" class="!gap-y-4 lg:!gap-y-6">
    <div class="flex flex-col gap-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <h2 class="text-26 font-bold uppercase tracking-wide lg:text-3xl lg:leading-8">
        {{ $t("pages.account.quote_details.title", [quote!.number]) }}
      </h2>
    </div>

    <div class="-mx-5 border-y bg-white shadow-md-x lg:mx-0 lg:space-y-6 lg:border-0 lg:bg-transparent lg:shadow-none">
      <!-- Quote comment -->
      <VcSectionWidget
        :title="$t('pages.account.quote_details.remarks')"
        icon="document-text"
        content-classes="px-6 pb-1 pt-2 lg:px-7 lg:pb-2"
      >
        <VcTextarea
          v-model.trim="quote.comment"
          :label="$t('pages.account.quote_details.remarks_field_label')"
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
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.shipping_address") }}
        </h4>

        <div class="mt-2 flex flex-col gap-3 rounded border p-5 empty:hidden md:flex-row md:items-center">
          <VcAddressInfo v-if="shippingAddress" class="grow text-15" :address="shippingAddress" />

          <VcAlert v-else class="grow" type="warning" icon>
            {{ $t("pages.account.quote_details.no_address_message") }}
          </VcAlert>

          <div class="flex justify-end">
            <VcButton
              :disabled="fetching"
              :title="$t('common.buttons.edit')"
              icon="pencil"
              size="sm"
              variant="outline"
              @click="
                userHasAddresses
                  ? openAddressSelectionDialog(AddressType.Shipping)
                  : openAddOrUpdateAddressDialog(AddressType.Shipping, shippingAddress)
              "
            />
          </div>
        </div>
      </VcSectionWidget>

      <!-- Quote billing address -->
      <VcSectionWidget :title="$t('pages.account.quote_details.billing_address')" icon="cash">
        <h4 class="text-md font-bold leading-5">
          {{ $t("pages.account.quote_details.billing_address") }}
        </h4>

        <div class="mt-2.5 rounded border p-5">
          <VcCheckbox
            :model-value="billingAddressEqualsShipping"
            :disabled="fetching"
            @change="toggleBillingAddressEqualsShippingAddress"
          >
            {{ $t("pages.account.quote_details.same_as_shipping_address") }}
          </VcCheckbox>

          <div
            v-if="!billingAddressEqualsShipping"
            class="mt-4 flex flex-col gap-3 empty:hidden md:flex-row md:items-center"
          >
            <VcAddressInfo v-if="billingAddress" class="grow text-15" :address="billingAddress" />

            <VcAlert v-else class="grow" type="warning" icon>
              {{ $t("pages.account.quote_details.no_address_message") }}
            </VcAlert>

            <div class="flex justify-end">
              <VcButton
                :disabled="fetching"
                :title="$t('common.buttons.edit')"
                icon="pencil"
                size="sm"
                variant="outline"
                @click="
                  userHasAddresses
                    ? openAddressSelectionDialog(AddressType.Billing)
                    : openAddOrUpdateAddressDialog(AddressType.Billing, billingAddress)
                "
              />
            </div>
          </div>
        </div>
      </VcSectionWidget>

      <div class="flex flex-wrap gap-5 px-6 py-7 lg:justify-end lg:p-0">
        <VcButton
          :disabled="!quoteChanged || !quoteItemsValid || fetching"
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
import { asyncForEach, convertToType } from "@/core/utilities";
import { QuoteLineItems, useUserAddresses, useUserQuote } from "@/shared/account";
import { SelectAddressModal } from "@/shared/checkout";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import { VcAddOrUpdateAddressModal } from "@/ui-kit/components";
import type { MemberAddressType, QuoteAddressType, QuoteItemType, QuoteType } from "@/xapi/types";

interface IProps {
  quoteId: string;
}

const props = defineProps<IProps>();

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

const quoteChanged = computed<boolean>(() => !isEqual(originalQuote.value, quote.value));
const quoteItemsValid = computed<boolean>(() =>
  every(quote.value?.items, (item: QuoteItemType) => item.selectedTierPrice?.quantity > 0)
);
const quoteValid = computed<boolean>(
  () =>
    !!shippingAddress.value && (!!billingAddress.value || billingAddressEqualsShipping.value) && quoteItemsValid.value
);

const userHasAddresses = computedEager<boolean>(() => !!addresses.value.length);

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

function openAddressSelectionDialog(addressType: AddressType): void {
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

function openAddOrUpdateAddressDialog(addressType: AddressType, currentAddress?: QuoteAddressType): void {
  openPopup({
    component: VcAddOrUpdateAddressModal,
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
    if (billingAddressEqualsShipping.value) {
      setBillingAddressEqualsShippingAddress();
    }
    await updateAddresses(quote.value!.id, quote.value!.addresses);
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
