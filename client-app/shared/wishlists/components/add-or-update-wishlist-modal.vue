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
        :disabled="loading"
        :message="errors.name"
        :error="!!errors.name && meta.dirty"
        required
      />

      <VcTextarea
        v-model="description"
        data-test-id="wishlist-description-input"
        :label="$t('common.labels.description')"
        :disabled="loading"
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
          :disabled="loading"
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

        <template v-if="isCustomerScope">
          <VcSelect
            v-model="selectedOrganizationIds"
            test-id-dropdown="wishlist-share-customers-select"
            :label="$t('shared.wishlists.add_or_update_wishlist_modal.share_customers_label')"
            :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.share_customers_placeholder')"
            :disabled="shareLoading"
            :items="customerOptions"
            text-field="organizationName"
            value-field="organizationId"
            multiple
            autocomplete
          />

          <VcTextarea
            v-model="shareMessage"
            :label="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_label')"
            :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.share_message_placeholder')"
            :disabled="shareLoading"
            rows="3"
            counter
            :max-length="SHARE_MESSAGE_MAX_LENGTH"
          />

          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <VcCheckbox v-model="shareSendEmail" :disabled="shareLoading">
              {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_send_email") }}
            </VcCheckbox>

            <VcCheckbox v-model="shareSendPush" :disabled="shareLoading">
              {{ $t("shared.wishlists.add_or_update_wishlist_modal.share_send_push") }}
            </VcCheckbox>
          </div>
        </template>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.add_or_update_wishlist_modal.cancel_button") }}
      </VcButton>

      <VcButton
        data-test-id="wishlist-settings-save-button"
        :loading="loading || shareLoading"
        :disabled="!canSave"
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
import { useSalesRepCustomerOptions } from "@/modules/sales-rep/composables/useSalesRepCustomerOptions";
import { useSalesRepShareList } from "@/modules/sales-rep/composables/useSalesRepShareList";
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

const { loading, createWishlist, updateWishlist } = useWishlists();
const { shareList, loading: shareLoading } = useSalesRepShareList();
const { isCorporateMember, checkPermissions } = useUser();

const isEditMode = computed<boolean>(() => !!props.list);

// "Customer" scope (VCST-5332): a Sales Rep publishes an EXISTING list to specific customer organizations,
// gated on the Sales Rep module being installed/enabled and the caller holding the rep permission.
const canShareWithCustomers = computed(
  () => isEditMode.value && isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION),
);
// Only fetched when the caller can share (avoids an authorized request for everyone else).
const { options: customerOptions } = useSalesRepCustomerOptions(canShareWithCustomers);

// Message cap leaves room for the shared-list link the backend appends (1000-char combined limit).
const SHARE_MESSAGE_MAX_LENGTH = 900;
const selectedOrganizationIds = ref<string[]>([]);
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
const canSave = computed<boolean>(() => {
  if (!meta.value.valid) {
    return false;
  }

  return isCustomerScope.value ? selectedOrganizationIds.value.length > 0 : meta.value.dirty;
});

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid) {
    return;
  }

  if (isCustomerScope.value) {
    if (await shareWithCustomers()) {
      closeHandle();
    }
    return;
  }

  if (isEditMode.value) {
    await updateWishlist({
      listId: props.list!.id,
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
    });
  } else {
    await createWishlist({
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
    });
  }

  closeHandle();
}

async function shareWithCustomers(): Promise<boolean> {
  const result = await shareList({
    listId: props.list!.id,
    organizationIds: selectedOrganizationIds.value,
    sendEmail: shareSendEmail.value,
    sendPush: shareSendPush.value,
    message: shareMessage.value.trim() || undefined,
  });

  if (!result.succeeded) {
    notifications.error({
      text: t("shared.wishlists.add_or_update_wishlist_modal.share_error"),
      single: true,
    });
    return false;
  }

  notifications[result.warnings.length ? "warning" : "success"]({
    text: t(
      `shared.wishlists.add_or_update_wishlist_modal.${result.warnings.length ? "share_partial" : "share_success"}`,
    ),
    duration: 4000,
    single: true,
  });

  return true;
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
