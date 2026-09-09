<template>
  <VcModal
    :title="$t('shared.wishlists.share_wishlist_modal.title', { listName: list.name })"
    dividers
    is-mobile-fullscreen
    test-id="share-wishlist-modal"
    :is-persistent="saving"
  >
    <div class="space-y-4">
      <VcSelect
        v-model="sharingScope"
        test-id-dropdown="wishlist-sharing-scope-select"
        :label="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_scope_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_scope_placeholder')"
        :disabled="saving"
        :items="listSharingScopes"
        text-field="label"
        value-field="id"
      />

      <VcInput
        v-if="listSharingScopeSupportsLink"
        :model-value="sharingLink"
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

    <template #actions="{ close }">
      <!-- Dismissing mid-save would unmount the tree the follow-up still needs, losing it without a trace.
           `isPersistent` covers Esc, the backdrop and the header X; this button needs its own guard. -->
      <VcButton
        data-test-id="wishlist-sharing-cancel-button"
        color="secondary"
        variant="outline"
        :disabled="saving"
        @click="close"
      >
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton
        data-test-id="wishlist-sharing-save-button"
        :loading="saving"
        :disabled="!canSave || saving"
        class="ms-auto"
        @click="save(close)"
      >
        {{ activeScopeElement ? $t("shared.wishlists.list_card.share_button") : $t("common.buttons.save") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { useWishlistSharingScopes } from "../composables/useWishlistSharingScopes";
import { useWishlists } from "../composables/useWishlists";
import type { IWishlistSharingScopeControlsType } from "../composables/useWishlistSharingScopes";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list: WishlistType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard();
const notifications = useNotifications();

const listSharingScope = computed<string>(() => props.list.sharingSetting?.scope ?? WishlistScopeType.Private);
const listSharedWithId = computed<string | undefined>(() => props.list.sharingSetting?.sharedWithId ?? undefined);

// `autoRefetch: false`: the composable refetches outside its own try/catch and rethrows, so a refetch hiccup after a
// successful mutation would look like a failed save and skip the scope's follow-up. Refreshed explicitly below instead.
const { updateWishlist, fetchWishlists } = useWishlists({ autoRefetch: false });
const { sharingScopes, getSharingScope, isSharingScopeAvailable } = useWishlistSharingScopes();

// Modal-owned busy flag for the save action. Driven with try/finally so the Save button can never get stuck
// showing the loader (useWishlists' shared `loading` can leak true on error), and it guards against double-submit.
const saving = ref(false);

const sharingScope = ref<string>(listSharingScope.value);

const scopeControls = useTemplateRef<IWishlistSharingScopeControlsType>("scopeControls");

const listSharingScopes = computed(() => {
  const available = sharingScopes.value.filter(isSharingScopeAvailable);

  // A scope the list already carries stays listed even when it isn't on offer, or the select would render empty and
  // saving would silently rewrite it. The provider may be gone entirely, hence the fallback to the raw value.
  const persisted = listSharingScope.value;
  const isPersistedListed = available.some((scope) => scope.scope === persisted);
  const scopes = [...available];

  if (!isPersistedListed) {
    const known = getSharingScope(persisted);
    scopes.push({ ...(known ?? { scope: persisted, labelKey: "" }) });
  }

  return scopes.map((scope) => ({
    id: scope.scope,
    label: scope.labelKey ? t(scope.labelKey) : scope.scope,
  }));
});

const activeScope = computed(() => getSharingScope(sharingScope.value));
// Such a scope stays listed (see above) but must not offer its controls — that capability is what this user lacks.
const activeScopeElement = computed(() =>
  activeScope.value && isSharingScopeAvailable(activeScope.value) ? activeScope.value.element : undefined,
);
const listSharingScopeSupportsLink = computed(() => !!activeScope.value?.supportsLink);
const sharingKey = computed(() => props.list.sharingSetting?.id ?? crypto.randomUUID());
const sharingLink = computed(() => `${location.protocol}//${location.host}/shared-list/${sharingKey.value}`);

// While the scope's component is still resolving, Save stays disabled rather than saving a half-configured scope.
const scopeCanSave = computed(() => (activeScopeElement.value ? !!scopeControls.value?.canSave : true));
const scopeDirty = computed(() => !!scopeControls.value?.dirty);
const scopeChanged = computed(() => sharingScope.value !== listSharingScope.value);

const canSave = computed<boolean>(() => scopeCanSave.value && (scopeChanged.value || scopeDirty.value));

async function save(closeHandle: () => void): Promise<void> {
  if (!canSave.value || saving.value) {
    return;
  }

  saving.value = true;
  try {
    // Sharing only: the list's name and description are owned by the rename dialog and are not sent from here. A scope
    // without controls contributes nothing — the backend applies a null target for its own non-targeted scopes.
    await updateWishlist({
      listId: props.list.id,
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
      ...(scopeControls.value?.payload ?? {}),
    });

    // Saved from here on, so neither the follow-up nor the refresh may surface as a save error. Both are awaited to
    // keep the loader up.
    try {
      await scopeControls.value?.onSaved?.({
        listName: props.list.name ?? "",
        sharingLink: sharingLink.value,
      });
    } catch (e) {
      Logger.error("ShareWishlistModal: sharing scope onSaved failed", e);
    }

    try {
      await fetchWishlists();
    } catch (e) {
      Logger.error("ShareWishlistModal: refreshing the lists after save failed", e);
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
