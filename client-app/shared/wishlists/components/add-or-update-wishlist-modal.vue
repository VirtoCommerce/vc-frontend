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
    :is-persistent="saving"
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
    </div>

    <template #actions="{ close }">
      <!-- `isPersistent` covers Esc, the backdrop and the header X while a write is in flight; this button needs its
           own guard. -->
      <VcButton
        data-test-id="wishlist-settings-cancel-button"
        color="secondary"
        variant="outline"
        :disabled="saving"
        @click="close"
      >
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
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const notifications = useNotifications();

const listName = computed<string | undefined>(() => props.list?.name);
const listDescription = computed<string | undefined>(() => props.list?.description);

// `autoRefetch: false`: the composable refetches outside its own try/catch and rethrows, so a refetch hiccup after a
// successful mutation would look like a failed save. Refreshed explicitly below instead.
const { createWishlist, updateWishlist, fetchWishlists } = useWishlists({ autoRefetch: false });

// Modal-owned busy flag for the save action. Driven with try/finally so the Save button can never get stuck
// showing the loader (useWishlists' shared `loading` can leak true on error), and it guards against double-submit.
const saving = ref(false);

const isEditMode = computed<boolean>(() => !!props.list);

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = toTypedSchema(
  object({
    name: string().trim().required().max(25),
    description: string().max(MAX_DESCRIPTION_LENGTH),
  }),
);

const { errors, meta } = useForm({
  validationSchema,
  initialValues: {
    name: listName.value,
    description: listDescription.value ?? "",
  },
  validateOnMount: true,
});

const { value: name } = useField<string | undefined>("name");
const { value: description } = useField<string | undefined>("description");

const canSave = computed<boolean>(() => meta.value.valid && meta.value.dirty);

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid || saving.value) {
    return;
  }

  saving.value = true;
  try {
    const payload = {
      listName: name.value?.trim(),
      description: description.value?.trim(),
    };

    if (isEditMode.value) {
      // Name and description only — sharing is owned by the share dialog and must not be touched from here.
      await updateWishlist({ listId: props.list!.id, ...payload });
    } else {
      // A new list starts private; it is shared afterwards through the share dialog.
      await createWishlist({ ...payload, scope: WishlistScopeType.Private, sharingKey: crypto.randomUUID() });
    }

    // Saved from here on, so the refresh may not surface as a save error. Awaited to keep the loader up.
    try {
      await fetchWishlists();
    } catch (e) {
      Logger.error("AddOrUpdateWishlistModal: refreshing the lists after save failed", e);
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
</script>
