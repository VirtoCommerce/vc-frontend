<template>
  <div v-if="quote" class="!gap-y-4 lg:!gap-y-6">
    <div class="space-y-3">
      <VcBreadcrumbs :items="breadcrumbs" />

      <VcTypography tag="h1">
        {{ $t("quote_details.title", [quote!.number]) }}
      </VcTypography>
    </div>

    <div class="space-y-5 lg:space-y-6">
      <!-- Quote comment -->
      <VcWidget :title="$t('quote_details.comment')" prepend-icon="document-text" size="lg">
        <VcTextarea
          v-model.trim="comment"
          :label="$t('quote_details.comment_field_label')"
          :disabled="fetching"
          :max-length="1000"
          :rows="4"
          :required="!hasItems"
          :error="!commentValid"
          :message="commentErrorMessage"
          :aria-label="$t('quote_details.quote_request_comment')"
          no-resize
          counter
          @input="editComment"
        />
      </VcWidget>

      <VcWidget v-if="$cfg.files_enabled" :title="$t('quote_details.files')" prepend-icon="document-add" size="lg">
        <VcFileUploader
          v-bind="fileOptions"
          :files="files"
          removable
          @add-files="onAddFiles"
          @remove-files="onRemoveFiles"
          @download="onFileDownload"
        />
      </VcWidget>

      <!-- Quote products -->
      <VcWidget :title="$t('quote_details.products')" prepend-icon="cube" size="lg">
        <QuoteLineItems :items="quote.items" @update:item="onUpdateItem" @remove:item="onRemoveItem" />
      </VcWidget>

      <VcWidget :title="$t('quote_details.shipping_address')" prepend-icon="truck" size="lg">
        <VcLabel :required="isShippingAddressRequired">{{ $t("quote_details.shipping_address") }}</VcLabel>

        <div :class="['mt-2.5 rounded border p-5', { 'cursor-not-allowed bg-neutral-50': fetching }]">
          <AddressSelection
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
      <VcWidget :title="$t('quote_details.billing_address')" prepend-icon="cash" size="lg">
        <VcLabel required>{{ $t("quote_details.billing_address") }}</VcLabel>

        <div :class="['mt-2.5 space-y-1.5 rounded border p-5', { 'cursor-not-allowed bg-neutral-50': fetching }]">
          <VcCheckbox
            :model-value="billingAddressEqualsShipping"
            :disabled="fetching || !shippingAddress"
            @change="toggleBillingAddressEqualsShippingAddress"
          >
            {{ $t("quote_details.same_as_shipping_address") }}
          </VcCheckbox>

          <AddressSelection
            :placeholder="
              shippingAddress && billingAddressEqualsShipping
                ? $t('quote_details.select_shipping_address')
                : $t('quote_details.select_billing_address')
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

    <div class="flex flex-wrap gap-5 py-7 *:max-lg:flex-1 lg:justify-end lg:[--vc-button-min-width:12.5rem]">
      <VcButton :disabled="!canSaveChanges || fetching" variant="outline" @click="saveChanges">
        {{ $t("quote_details.save_changes") }}
      </VcButton>

      <VcButton :disabled="!canSubmit || fetching" @click="submit">
        {{ $t("quote_details.submit") }}
      </VcButton>
    </div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { computedEager } from "@vueuse/core";
import { cloneDeep, every, isEqual, remove } from "lodash";
import { useField } from "vee-validate";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from "vue-router";
import { string } from "yup";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { AddressType } from "@/core/enums";
import { asyncForEach, isEqualAddresses } from "@/core/utilities";
import { FILE_UPLOAD_SCOPE_NAME, MODULE_ID } from "@/modules/quotes/constants";
import { useUser, useUserAddresses } from "@/shared/account";
import { SelectAddressModal } from "@/shared/checkout";
import { AddressSelection, SaveChangesModal } from "@/shared/common";
import { useOrganizationAddresses } from "@/shared/company";
import { downloadFile, useFiles } from "@/shared/files";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import QuoteLineItems from "../components/quote-line-items.vue";
import { useUserQuote } from "../useUserQuote";
import type { MemberAddressFieldsFragment } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import type { QuoteAddressType, QuoteItemType, QuoteType } from "@/modules/quotes/api/graphql/types";
import type { StringSchema } from "yup";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

interface IProps {
  quoteId?: string;
}

const props = defineProps<IProps>();

const router = useRouter();
const { t } = useI18n();
const { openModal, closeModal } = useModal();
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
  allItemsAreDigital,
  shippingAddress,
  billingAddress,
  attachedFiles,
  setQuoteAddress,
  fetchQuote,
  changeComment,
  changeItemQuantity,
  updateAddresses,
  removeItem,
  submitQuote,
  updateAttachments,
} = useUserQuote();

const DEFAULT_QUOTE_FILES_SCOPE = "quote-attachments";
const { getSettingValue } = useModuleSettings(MODULE_ID);
const quoteFilesScope = getSettingValue(FILE_UPLOAD_SCOPE_NAME);

const {
  files,
  attachedAndUploadedFiles,
  anyFilesModified,
  allFilesAttachedOrUploaded,
  addFiles,
  validateFiles,
  uploadFiles,
  removeFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(quoteFilesScope ? String(quoteFilesScope) : DEFAULT_QUOTE_FILES_SCOPE, attachedFiles);
const notifications = useNotifications();

usePageHead({
  title: t("quote_details.title", [quote.value?.number]),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("quotes.navigation.route_name"), route: { name: "Quotes" } },
  { title: t("quote_details.title", [quote?.value?.number]) },
]);

const originalQuote = ref<QuoteType>();
const billingAddressEqualsShipping = ref<boolean>(true);
const comment = ref<string>();
const commentValid = ref(true);

const hasItems = computed<boolean>(() => !!quote.value?.items?.length);

const accountAddresses = computed<AnyAddressType[]>(() => {
  const { firstName, lastName } = user.value.contact ?? {};

  return isCorporateMember.value
    ? organizationsAddresses.value.map((address) => ({ ...address, firstName, lastName }))
    : personalAddresses.value;
});

const canSaveChanges = computed<boolean>(() => {
  const isQuoteChanged = !isEqual(originalQuote.value, quote.value);
  const isCommentChanged = originalQuote.value?.comment !== comment.value;
  const areAddressesChanged =
    !isEqual(quote.value!.addresses, originalQuote.value!.addresses) ||
    (billingAddressEqualsShipping.value && !isBillingAddressEqualsShipping.value);

  const hasChanges = isQuoteChanged || isCommentChanged || areAddressesChanged || anyFilesModified.value;

  return hasChanges && commentValid.value && allFilesAttachedOrUploaded.value;
});

const quoteItemsValid = computed<boolean>(
  () =>
    !!quote.value?.items?.length &&
    every(
      quote.value?.items,
      (item: QuoteItemType) => !!item.selectedTierPrice?.quantity && item.selectedTierPrice.quantity > 0,
    ),
);

const isShippingAddressRequired = computed<boolean>(() => {
  return hasItems.value && !allItemsAreDigital.value;
});

const canSubmit = computed<boolean>(() => {
  const isShippingAddressValid = !isShippingAddressRequired.value || !!shippingAddress.value;
  const isBillingAddressValid =
    !!billingAddress.value || (billingAddressEqualsShipping.value && !!shippingAddress.value);
  const isCommentValid = !!comment.value || quoteItemsValid.value;

  return isShippingAddressValid && isBillingAddressValid && isCommentValid && !anyFilesModified.value;
});

const userHasAddresses = computedEager<boolean>(() => !!accountAddresses.value.length);

const isBillingAddressEqualsShipping = computed<boolean>(() => {
  if (shippingAddress.value && billingAddress.value) {
    return isEqualAddresses(shippingAddress.value, billingAddress.value);
  } else if (shippingAddress.value && !billingAddress.value) {
    return true;
  }

  return false;
});

const commentValidationSchema = computed<StringSchema>(() =>
  string()
    .max(1000)
    .test({
      message: t("common.messages.required_field"),
      test: (value) => Promise.resolve(hasItems.value || (!hasItems.value && !!value)),
    }),
);

const {
  errorMessage: commentErrorMessage,
  setValue: setCommentValue,
  validate: validateComment,
} = useField("comment", toTypedSchema(commentValidationSchema.value));

async function editComment(): Promise<void> {
  setCommentValue(comment.value);

  const result = await validateComment();
  commentValid.value = result.valid;
}

function accountAddressExists(address: AnyAddressType): boolean {
  return accountAddresses.value.some((item) => isEqualAddresses(item, address));
}

function onRemoveItem(itemId: string): void {
  remove(quote.value!.items, ({ id }) => id === itemId);
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
  openModal({
    component: AddOrUpdateAddressModal,
    props: {
      address: currentAddress,

      async onResult(updatedAddress: MemberAddressFieldsFragment): Promise<void> {
        const quoteAddress = cloneDeep({ ...updatedAddress, addressType }) as QuoteAddressType;

        setQuoteAddress(quoteAddress);
        closeModal();

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
  openModal({
    component: SelectAddressModal,
    props: {
      addresses: accountAddresses.value,
      currentAddress: cloneDeep(addressType === AddressType.Billing ? billingAddress.value : shippingAddress.value),
      isCorporateAddresses: isCorporateMember.value,

      onResult(selectedAddress: MemberAddressFieldsFragment): void {
        const quoteAddress = cloneDeep({ ...selectedAddress, addressType }) as QuoteAddressType;

        setQuoteAddress(quoteAddress);
        setBillingAddressEqualsShipping();
        closeModal();
      },

      onAddNewAddress() {
        setTimeout(() => {
          openAddOrUpdateAddressModal(addressType);
        }, 500);
      },
    },
  });
}

async function onAddFiles(items: INewFile[]) {
  addFiles(items);
  validateFiles();
  await uploadFiles();
}

async function onRemoveFiles(items: FileType[]) {
  await removeFiles(items);
}

// Due API concurrency errors each query will be sended consecutively
async function saveChanges(): Promise<void> {
  if (anyFilesModified.value) {
    await updateAttachments(quote.value!.id, attachedAndUploadedFiles.value);
  }

  if (originalQuote.value?.comment !== comment.value) {
    await changeComment(quote.value!.id, comment.value!);
  }

  await asyncForEach(originalQuote.value!.items, async (originalItem: QuoteItemType) => {
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
    html: t("quote_details.save_changes_notification_success"),
  });

  originalQuote.value = cloneDeep(quote.value);
}

async function submit(): Promise<void> {
  if (canSaveChanges.value) {
    await saveChanges();
  }

  await submitQuote(quote.value!.id, comment.value || "");

  void router.replace({ name: "Quotes" });
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

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

function onUpdateItem({ itemId, quantity }: { itemId: string; quantity: number }): void {
  const item = quote.value!.items.find(({ id }) => id === itemId);
  if (item) {
    item.selectedTierPrice!.quantity = quantity;
  }
}

onMounted(() => {
  if (quote.value && quote.value.status !== "Draft") {
    void router.replace({ name: "ViewQuote", params: { quoteId: quote.value.id } });
  }
});

watchEffect(async () => {
  await Promise.all([fetchFileOptions(), fetchAddresses(), fetchQuote({ id: props.quoteId })]);

  originalQuote.value = cloneDeep(quote.value);
  comment.value = quote.value?.comment;
  setBillingAddressEqualsShipping();
});

async function canChangeRoute(): Promise<boolean> {
  return !canSaveChanges.value || (await openSaveChangesModal());
}

async function openSaveChangesModal(): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    openModal({
      component: SaveChangesModal,
      props: {
        title: t("pages.account.list_details.save_changes"),
        message: t("common.messages.save_changes"),
        onConfirm: async () => {
          closeModal();
          await saveChanges();
          resolve(true);
        },
        onClose: () => {
          resolve(true);
        },
      },
    });
  });
}

onBeforeRouteLeave(canChangeRoute);
onBeforeRouteUpdate(canChangeRoute);
</script>
