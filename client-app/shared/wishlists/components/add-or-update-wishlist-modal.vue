<template>
  <VcModal
    :title="isEditMode
      ? $t('shared.wishlists.add_or_update_wishlist_modal.edit_mode_title')
      : $t('shared.wishlists.add_or_update_wishlist_modal.title')
      "
    dividers
    is-mobile-fullscreen
  >
    <div class="space-y-4">
      <VcInput
        v-model="name"
        :label="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_placeholder')"
        :disabled="loading"
        :message="errors.name"
        :error="!!errors.name && meta.dirty"
        required
      />

      <VcTextarea
        v-model="description"
        :label="$t('common.labels.description')"
        :disabled="loading"
        :message="errors.description"
        :error="!!errors.description && meta.dirty"
        rows="4"
        counter
        :max-length="MAX_DESCRIPTION_LENGTH"
      />

      <div
        v-if="isCorporateMember"
        class="space-y-4"
      >
        <VcSelect
          v-model="sharingScope"
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
              variant="solid-light"
              icon="document-duplicate"
              icon-size="1.25rem"
              @click="copySharingLink"
            ></VcButton>
          </template>
        </VcInput>
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton
        color="secondary"
        variant="outline"
        @click="close"
      >
        {{ $t("shared.wishlists.add_or_update_wishlist_modal.cancel_button") }}
      </VcButton>

      <VcButton
        :loading="loading"
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
import { computed } from "vue";
import { object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const { t } = globals.i18n.global;

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard();
const notifications = useNotifications();

const listName = computed<string | undefined>(() => props.list?.name);
const listDescription = computed<string | undefined>(() => props.list?.description);
const listSharingScope = computed<string | undefined>(() => props.list?.sharingSetting?.scope);

const { loading, createWishlist, updateWishlist } = useWishlists();
const { isCorporateMember } = useUser();

const listSharingScopes = computed(() => {
  return [
    { id: WishlistScopeType.Private, label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Private}`) },
    { id: WishlistScopeType.AnyoneAnonymous, label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.AnyoneAnonymous}`) },
    { id: WishlistScopeType.Organization, label: t(`shared.wishlists.add_or_update_wishlist_modal.sharing_scope.${WishlistScopeType.Organization}`) },
  ]
});

const listSharingScopeSupportsLink = computed(() => sharingScope.value == WishlistScopeType.AnyoneAnonymous || sharingScope.value == WishlistScopeType.Organization);
const sharingKey = computed(() => props.list?.sharingSetting?.id ?? crypto.randomUUID());
const sharingLink = computed(() => `${location.protocol}//${location.host}/shared-list/${sharingKey.value}`);

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = toTypedSchema(
  object({
    name: string().required().max(25),
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

const isEditMode = computed<boolean>(() => !!props.list);
const canSave = computed<boolean>(() => meta.value.dirty && meta.value.valid);

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid) {
    return;
  }

  if (isEditMode.value) {
    await updateWishlist({
      listId: props.list!.id,
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value
    });
  } else {
    await createWishlist({
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value
    });
  }

  closeHandle();
}

async function copySharingLink() {
  await copyToClipboard(sharingLink.value);

  notifications.success({
    text: t("shared.wishlists.add_or_update_wishlist_modal.clipboard_success"),
    duration: 4000,
    single: true,
  });
};
</script>
