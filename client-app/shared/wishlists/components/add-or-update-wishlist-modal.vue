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
    class="add-or-update-wishlist-modal"
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
            :message="
              replacesPreviousTarget ? $t('shared.wishlists.add_or_update_wishlist_modal.share_replace_hint') : ''
            "
            text-field="organizationName"
            value-field="organizationId"
            autocomplete
            clearable
          />

          <template v-if="isNewCustomerTarget">
            <VcTextarea
              v-model="shareMessage"
              data-test-id="wishlist-share-message-input"
              :label="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_label')"
              :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_placeholder')"
              :disabled="saving"
              rows="3"
              counter
              :max-length="shareMessageMaxLength"
            />

            <fieldset>
              <VcLabel class="add-or-update-wishlist-modal__channels-label">
                {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_channels_label") }}
              </VcLabel>

              <div class="add-or-update-wishlist-modal__channels">
                <VcCheckbox v-model="sendEmail" :disabled="saving" data-test-id="wishlist-share-email-checkbox">
                  {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_email_label") }}
                </VcCheckbox>

                <VcCheckbox v-model="sendPush" :disabled="saving" data-test-id="wishlist-share-push-checkbox">
                  {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_push_label") }}
                </VcCheckbox>
              </div>
            </fieldset>
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
import { isSalesRepUser } from "@/modules/sales-rep/composables/useSalesRepsConfig";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const { t, te } = useI18n();

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
const { isCorporateMember } = useUser();

const isEditMode = computed<boolean>(() => !!props.list);

// "Customer" scope (VCST-5332): a Sales Rep publishes a list to a customer organization. Available in both create
// and edit mode. Gated on the shared rep predicate, so this surface can't drift from the hub's own gate.
const canShareWithCustomers = computed(isSalesRepUser);
// Only fetched when the caller can share (avoids an authorized request for everyone else).
const { options: customerOptions } = useSalesRepCustomerOptions(canShareWithCustomers);

// The backend rejects a combined message over 1000 chars, and the sharing link is appended to whatever the rep
// writes. Measuring the actual link (its host varies per store) keeps a long domain from silently pushing an
// otherwise-valid message over the limit.
const NOTIFICATION_MESSAGE_LIMIT = 1000;
const SEPARATOR_LENGTH = 2;
// Pre-fill from the list's current target so re-opening a Customer-shared list shows the selected customer.
const selectedOrganizationId = ref<string | undefined>(listSharedWithId.value);
const shareMessage = ref("");
// Both channels on by default: publishing to a customer is pointless if they hear about it on neither. Unlike the
// rep's standalone "Send a message" modal, clearing both is allowed here — it just saves the list without notifying.
const sendEmail = ref(true);
const sendPush = ref(true);

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

  // Also offered when the list already carries the scope, so a non-rep opening such a list sees its actual value
  // instead of an empty select (and cannot silently overwrite the scope by saving).
  if (canShareWithCustomers.value || listSharingScope.value === WishlistScopeType.Customer) {
    scopes.push({
      id: WishlistScopeType.Customer,
      label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Customer}`),
    });
  }

  return scopes;
});

// Scopes whose list is reachable by its link, so the owner can copy it (e.g. a rep pasting it into their own email).
const LINKABLE_SCOPES = new Set<string>([
  WishlistScopeType.AnyoneAnonymous,
  WishlistScopeType.Organization,
  WishlistScopeType.Customer,
]);

const listSharingScopeSupportsLink = computed(() => !!sharingScope.value && LINKABLE_SCOPES.has(sharingScope.value));
const sharingKey = computed(() => props.list?.sharingSetting?.id ?? crypto.randomUUID());
const sharingLink = computed(() => `${location.protocol}//${location.host}/shared-list/${sharingKey.value}`);
const shareMessageMaxLength = computed(() => NOTIFICATION_MESSAGE_LIMIT - sharingLink.value.length - SEPARATOR_LENGTH);

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
const isNewCustomerTarget = computed(
  () =>
    isCustomerSharing.value &&
    !!selectedOrganizationId.value &&
    selectedOrganizationId.value !== listSharedWithId.value,
);

// The backend keeps a single sharing setting per list, so targeting another customer detaches the current one.
const replacesPreviousTarget = computed(() => isNewCustomerTarget.value && !!listSharedWithId.value);

const canSave = computed<boolean>(() => {
  if (!meta.value.valid) {
    return false;
  }

  // Picking a different customer is a change the form itself can't see (the target lives outside the vee-validate
  // schema), so it counts as dirty on its own. Re-opening a Customer list and touching nothing leaves Save disabled.
  if (isCustomerScope.value) {
    return !!selectedOrganizationId.value && (meta.value.dirty || isNewCustomerTarget.value);
  }

  return meta.value.dirty;
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

    // Notify the customer's members (reuses the VCST-5310 channel) when this edit set a genuinely new target and
    // at least one channel is on. The rep's own message is optional — a default one carries the link on its own.
    if (isNewCustomerTarget.value && sharedWithId && (sendEmail.value || sendPush.value)) {
      await notifyCustomer(sharedWithId);
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

// Localizes a backend warning code via the Sales Rep module's shared mapping (the codes are its domain). An unknown
// code — or a store where the module locale isn't loaded — yields nothing, so the caller keeps its own summary alone
// instead of repeating it once per code.
function localizeWarning(code: string): string | undefined {
  const moduleKey = `sales_rep.communication.warnings.${code}`;

  return te(moduleKey) ? t(moduleKey) : undefined;
}

async function notifyCustomer(organizationId: string): Promise<void> {
  const listNameValue = name.value?.trim() ?? "";
  // The rep's own text replaces the default body; the link is always appended so the customer can reach the list.
  const body =
    shareMessage.value.trim() ||
    t("shared.wishlists.add_or_update_wishlist_modal.share_default_message", { listName: listNameValue });

  const result = await sendCommunication({
    organizationId,
    sendEmail: sendEmail.value,
    sendPush: sendPush.value,
    title: t("shared.wishlists.add_or_update_wishlist_modal.share_default_title"),
    message: [body, sharingLink.value].join("\n\n"),
  });

  // Per-channel detail, when the backend named a reason we can translate.
  const details = result.warnings.map(localizeWarning).filter(Boolean).join(" ");
  // The list itself is already saved; a delivery problem is a warning about the notification, never a save error.
  const summary = result.succeeded
    ? t("shared.wishlists.add_or_update_wishlist_modal.share_partial")
    : t("shared.wishlists.add_or_update_wishlist_modal.share_notify_error");

  if (!result.succeeded || result.warnings.length) {
    notifications.warning({
      text: [summary, details].filter(Boolean).join(" "),
      duration: 10000,
      single: true,
    });

    return;
  }

  notifications.success({
    text: t("shared.wishlists.add_or_update_wishlist_modal.share_success"),
    duration: 10000,
    single: true,
  });
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

<style lang="scss">
.add-or-update-wishlist-modal {
  &__channels-label {
    @apply mb-2;
  }

  &__channels {
    @apply flex flex-col gap-2;
  }
}
</style>
