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

        <component
          :is="activeScopeElement"
          v-if="activeScopeElement"
          ref="scopeControls"
          :shared-with-id="listSharedWithId"
          :sharing-link="sharingLink"
          :saving="saving"
        />
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
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables";
import { useNotifications } from "@/shared/notification";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import { useWishlists } from "../composables/useWishlists";
import type { IWishlistSharingScopeControlsType } from "../composables/useWishlistSharingScopes";
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

// `autoRefetch: false` because the composable refetches *outside* its own try/catch and rethrows: a refetch hiccup
// after a successful mutation would otherwise look like a failed save and skip the scope's follow-up entirely — for
// customer sharing that means the customer gets access but never the email carrying the only link to it. The refresh
// happens explicitly below, after the follow-up, where its failure stays a non-event.
const { createWishlist, updateWishlist, fetchWishlists } = useWishlists({ autoRefetch: false });
const { sharingScopes, getSharingScope, isSharingScopeAvailable } = useWishlistSharingScopes();

// Modal-owned busy flag for the save action. Driven with try/finally so the Save button can never get stuck
// showing the loader (useWishlists' shared `loading` can leak true on error), and it guards against double-submit.
const saving = ref(false);
const { isCorporateMember } = useUser();

const isEditMode = computed<boolean>(() => !!props.list);

// Contributed scopes bring their own controls; this is how the modal reaches that instance's state.
const scopeControls = useTemplateRef<IWishlistSharingScopeControlsType>("scopeControls");

const listSharingScopes = computed(() => {
  const available = sharingScopes.value.filter(isSharingScopeAvailable);

  // A scope the list already carries stays listed even when it isn't on offer — otherwise the select would render
  // empty and saving would silently rewrite the scope. Covers both a revoked capability and an uninstalled provider,
  // hence the fallback label built from the raw value rather than a known key.
  const persisted = listSharingScope.value;
  const isPersistedListed = available.some((scope) => scope.scope === persisted);
  const scopes = [...available];

  if (persisted && !isPersistedListed) {
    const known = getSharingScope(persisted);
    scopes.push({ ...(known ?? { scope: persisted, labelKey: "" }) });
  }

  return scopes.map((scope) => ({
    id: scope.scope,
    label: scope.labelKey ? t(scope.labelKey) : scope.scope,
  }));
});

const activeScope = computed(() => getSharingScope(sharingScope.value));
// A scope the list carries but the current user may no longer use stays *listed* so saving cannot rewrite it, yet its
// controls must not appear — that capability is exactly what this user lacks.
const activeScopeElement = computed(() =>
  activeScope.value && isSharingScopeAvailable(activeScope.value) ? activeScope.value.element : undefined,
);
const listSharingScopeSupportsLink = computed(() => !!activeScope.value?.supportsLink);
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

// A scope with its own controls decides for itself whether its input is complete. While such a component is still
// resolving, Save stays disabled rather than letting the list be saved into a half-configured scope.
const scopeCanSave = computed(() => (activeScopeElement.value ? !!scopeControls.value?.canSave : true));
// Per-scope input lives outside the vee-validate schema, so the form's own `dirty` cannot see it.
const scopeDirty = computed(() => !!scopeControls.value?.dirty);

const canSave = computed<boolean>(
  () => meta.value.valid && scopeCanSave.value && (meta.value.dirty || scopeDirty.value),
);

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid || saving.value) {
    return;
  }

  saving.value = true;
  try {
    // Persist the list AND its sharing in a single mutation. A scope with controls contributes its own part of the
    // command; a scope without any contributes nothing, and the backend applies a null target for such scopes itself.
    const scopePayload = scopeControls.value?.payload ?? {};
    const payload = {
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
      ...scopePayload,
    };

    if (isEditMode.value) {
      await updateWishlist({ listId: props.list!.id, ...payload });
    } else {
      await createWishlist(payload);
    }

    // The list is saved from here on, so neither the follow-up nor the list refresh may surface as a save error.
    // Both are awaited to keep the loader up, and both swallow their own failures.
    try {
      await scopeControls.value?.onSaved?.({
        listName: name.value?.trim() ?? "",
        sharingLink: sharingLink.value,
      });
    } catch (e) {
      Logger.error("AddOrUpdateWishlistModal: sharing scope onSaved failed", e);
    }

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

async function copySharingLink() {
  await copyToClipboard(sharingLink.value);

  notifications.success({
    text: t("shared.wishlists.add_or_update_wishlist_modal.clipboard_success"),
    duration: 4000,
    single: true,
  });
}
</script>
