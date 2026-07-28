<template>
  <VcModal
    :title="
      isEditMode
        ? $t('shared.wishlists.add_or_update_wishlist_modal.edit_mode_title')
        : $t('shared.wishlists.add_or_update_wishlist_modal.title')
    "
    dividers
    is-mobile-fullscreen
    test-id="add-or-update-wishlist-modal"
  >
    <div class="space-y-4">
      <VcInput
        v-model="name"
        test-id-input="wishlist-name-input"
        :label="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_placeholder')"
        :disabled="saving"
        :message="errors.name"
        :error="!!errors.name && meta.dirty"
        required
      />

      <VcTextarea
        v-model="description"
        data-test-id="wishlist-description-input"
        :label="$t('common.labels.description')"
        :disabled="saving"
        :message="errors.description"
        :error="!!errors.description && meta.dirty"
        rows="4"
        counter
        :max-length="MAX_DESCRIPTION_LENGTH"
      />

      <div v-if="isCorporateMember" class="space-y-4">
        <VcSelect
          v-model="sharingScope"
          test-id-dropdown="wishlist-sharing-scope-select"
          :label="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_scope_label')"
          :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_scope_placeholder')"
          :disabled="saving"
          :items="listSharingScopes"
          text-field="label"
          value-field="id"
        >
        </VcSelect>

        <VcInput
          v-if="listSharingScopeSupportsLink"
          v-model="sharingLink"
          :label="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_link_label')"
          readonly
        >
          <template #append>
            <VcButton
              v-if="isClipboardSupported"
              color="secondary"
              variant="soft"
              icon="document-duplicate"
              icon-size="1.25rem"
              @click="copySharingLink"
            />
          </template>
        </VcInput>

        <template v-if="isCustomerSharing">
          <VcSelect
            v-model="selectedOrganizationId"
            test-id-dropdown="wishlist-share-customer-select"
            :label="$t('shared.wishlists.add_or_update_wishlist_modal.share_customers_label')"
            :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.share_customers_placeholder')"
            :disabled="saving"
            :items="customerOptions"
            text-field="organizationName"
            value-field="organizationId"
            autocomplete
            clearable
          />

          <template v-if="canNotify">
            <VcTextarea
              v-model="shareMessage"
              :label="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_label')"
              :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_placeholder')"
              :disabled="saving"
              rows="3"
              counter
              :max-length="SHARE_MESSAGE_MAX_LENGTH"
            />

            <div class="flex flex-wrap gap-x-6 gap-y-2">
              <VcCheckbox v-model="shareSendEmail" :disabled="saving">
                {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_send_email") }}
              </VcCheckbox>

              <VcCheckbox v-model="shareSendPush" :disabled="saving">
                {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_send_push") }}
              </VcCheckbox>
            </div>
          </template>
        </template>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.add_or_update_wishlist_modal.cancel_button") }}
      </VcButton>

      <VcButton
        data-test-id="wishlist-settings-save-button"
        :loading="saving"
        :disabled="!canSave || saving"
        class="ms-auto"
        @click="save(close)"
      >
        {{
          isEditMode
            ? $t("shared.wishlists.add_or_update_wishlist_modal.save_button")
            : $t("shared.wishlists.add_or_update_wishlist_modal.create_button")
        }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useClipboard } from "@vueuse/core";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useSalesRepCommunication } from "@/modules/sales-rep/composables/useSalesRepCommunication";
import { useSalesRepCustomerOptions } from "@/modules/sales-rep/composables/useSalesRepCustomerOptions";
import { isSalesRepsEnabled } from "@/modules/sales-rep/composables/useSalesRepsConfig";
import { SALES_REP_ACCESS_PERMISSION } from "@/modules/sales-rep/constants";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard();
const notifications = useNotifications();

const listName = computed<string | undefined>(() => props.list?.name);
const listDescription = computed<string | undefined>(() => props.list?.description);
const listSharingScope = computed<string | undefined>(() => props.list?.sharingSetting?.scope);
const listSharedWithId = computed<string | undefined>(() => props.list?.sharingSetting?.sharedWithId ?? undefined);

const { createWishlist, updateWishlist } = useWishlists();
const { sendCommunication } = useSalesRepCommunication();

// Modal-owned busy flag for the save action. Driven with try/finally so the Save button can never get stuck
// showing the loader (useWishlists' shared `loading` can leak true on error), and it guards against double-submit.
const saving = ref(false);
const { isCorporateMember, checkPermissions } = useUser();

const isEditMode = computed<boolean>(() => !!props.list);

// "Customer" scope (VCST-5332): a Sales Rep publishes a list to specific customer organizations. Available in
// both create and edit mode (on create the list is saved first to obtain an id, then shared). Gated on the
// Sales Rep module being installed/enabled and the caller holding the rep permission.
const canShareWithCustomers = computed(() => isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION));
// Only fetched when the caller can share (avoids an authorized request for everyone else).
const { options: customerOptions } = useSalesRepCustomerOptions(canShareWithCustomers);

// Message cap leaves room for the shared-list link the backend appends (1000-char combined limit).
const SHARE_MESSAGE_MAX_LENGTH = 900;
// Pre-fill from the list's current target so re-opening a Customer-shared list shows the selected customer.
const selectedOrganizationId = ref<string | undefined>(listSharedWithId.value);
const shareMessage = ref("");
const shareSendEmail = ref(true);
const shareSendPush = ref(true);

const listSharingScopes = computed(() => {
  const scopes = [
    {
      id: WishlistScopeType.Private,
      label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Private}`),
    },
    {
      id: WishlistScopeType.AnyoneAnonymous,
      label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.AnyoneAnonymous}`),
    },
    {
      id: WishlistScopeType.Organization,
      label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Organization}`),
    },
  ];

  if (canShareWithCustomers.value) {
    scopes.push({
      id: WishlistScopeType.Customer,
      label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Customer}`),
    });
  }

  return scopes;
});

const listSharingScopeSupportsLink = computed(
  () => sharingScope.value == WishlistScopeType.AnyoneAnonymous || sharingScope.value == WishlistScopeType.Organization,
);
const sharingKey = computed(() => props.list?.sharingSetting?.id ?? crypto.randomUUID());
const sharingLink = computed(() => `${location.protocol}//${location.host}/shared-list/${sharingKey.value}`);

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = toTypedSchema(
  object({
    name: string().trim().required().max(25),
    description: string().max(MAX_DESCRIPTION_LENGTH),
    sharingScope: string().required(),
  }),
);

const { errors, meta } = useForm({
  validationSchema,
  initialValues: {
    name: listName.value,
    description: listDescription.value ?? "",
    sharingScope: listSharingScope.value ?? WishlistScopeType.Private,
  },
  validateOnMount: true,
});

const { value: name } = useField<string | undefined>("name");
const { value: description } = useField<string | undefined>("description");
const { value: sharingScope } = useField<string | undefined>("sharingScope");

const isCustomerScope = computed(() => sharingScope.value === WishlistScopeType.Customer);

// The rep-only customer-sharing controls. Requires the module installed/enabled AND the caller be a rep, so a
// Customer-scoped list opened without that capability never exposes the rep UI/logic.
const isCustomerSharing = computed(() => canShareWithCustomers.value && isCustomerScope.value);

// Messaging is offered only when this edit sets a genuinely NEW customer target vs. what was persisted:
// non-Customer -> Customer, or a change to a different customer. Re-selecting the original (incl. A->B->A) = none.
const canNotify = computed(
  () =>
    isCustomerSharing.value &&
    !!selectedOrganizationId.value &&
    selectedOrganizationId.value !== listSharedWithId.value,
);

const canSave = computed<boolean>(() => {
  if (!meta.value.valid) {
    return false;
  }

  return isCustomerScope.value ? !!selectedOrganizationId.value : meta.value.dirty;
});

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid || saving.value) {
    return;
  }

  saving.value = true;
  try {
    // Persist the list AND its sharing in a single mutation. For the "Customer" scope the chosen organization is
    // passed as sharedWithId; the backend writes the scoped sharing setting.
    const sharedWithId = isCustomerScope.value ? selectedOrganizationId.value : undefined;
    const payload = {
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
      sharedWithId,
    };

    if (isEditMode.value) {
      await updateWishlist({ listId: props.list!.id, ...payload });
    } else {
      await createWishlist(payload);
    }

    // Notify the customer's members (reuses the VCST-5310 channel) only when messaging was offered — i.e. this
    // edit set a genuinely new customer target — and a channel is selected.
    if (canNotify.value && sharedWithId && (shareSendEmail.value || shareSendPush.value)) {
      const notified = await notifyCustomer(sharedWithId);
      notifications[notified ? "success" : "warning"]({
        text: t(`shared.wishlists.add_or_update_wishlist_modal.${notified ? "share_success" : "share_partial"}`),
        duration: 4000,
        single: true,
      });
    }

    closeHandle();
  } catch {
    // The underlying mutation already logs; surface a toast and let the user retry (the button resets below).
    notifications.error({
      text: t("shared.wishlists.add_or_update_wishlist_modal.save_error"),
      single: true,
    });
  } finally {
    saving.value = false;
  }
}

async function notifyCustomer(organizationId: string): Promise<boolean> {
  const message = [shareMessage.value.trim(), sharingLink.value].filter(Boolean).join("\n\n");
  const result = await sendCommunication({
    organizationId,
    sendEmail: shareSendEmail.value,
    sendPush: shareSendPush.value,
    message,
  });

  return result.succeeded;
}

async function copySharingLink() {
  await copyToClipboard(sharingLink.value);

  notifications.success({
    text: t("shared.wishlists.add_or_update_wishlist_modal.clipboard_success"),
    duration: 4000,
    single: true,
  });
}
</script>
