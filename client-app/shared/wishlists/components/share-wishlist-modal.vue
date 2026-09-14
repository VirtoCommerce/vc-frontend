<template>
  <VcModal
    :title="$t('shared.wishlists.share_wishlist_modal.title', { listName: list.name })"
    dividers
    is-mobile-fullscreen
    max-width="46rem"
    test-id="share-wishlist-modal"
    :is-persistent="saving"
  >
    <div class="share-wishlist-modal">
      <div>
        <VcLabel size="sm">{{ $t("shared.wishlists.share_wishlist_modal.who_can_access_label") }}</VcLabel>

        <div
          class="share-wishlist-modal__scopes"
          role="radiogroup"
          :aria-label="$t('shared.wishlists.share_wishlist_modal.who_can_access_label')"
        >
          <VcTabSwitch
            v-for="scope in listSharingScopes"
            :key="scope.id"
            :model-value="sharingScope"
            :value="scope.id"
            :label="scope.label"
            :icon="scope.icon"
            :disabled="saving"
            :data-test-id="`wishlist-sharing-scope-${scope.id}`"
            name="wishlist-sharing-scope"
            size="sm"
            class="share-wishlist-modal__scope"
            @change="sharingScope = $event"
          />
        </div>
      </div>

      <VcInput
        v-if="listSharingScopeSupportsLink"
        :model-value="sharingLink"
        :label="$t('shared.wishlists.add_or_update_wishlist_modal.sharing_link_label')"
        readonly
      >
        <template #append>
          <VcButton
            v-if="isClipboardSupported"
            data-test-id="wishlist-sharing-copy-link-button"
            color="secondary"
            variant="soft"
            icon="document-duplicate"
            icon-size="1.25rem"
            @click="copySharingLink"
          />
        </template>
      </VcInput>

      <!-- Kept alive so a scope's draft survives a look at another tab. The cache dies with the dialog. -->
      <KeepAlive>
        <component
          :is="activeScopeElement"
          v-if="activeScopeElement"
          ref="scopeControls"
          :targets="listTargets"
          :message="listMessage"
          :sharing-link="sharingLink"
          :saving="saving"
        />
      </KeepAlive>

      <!-- Rendered here, not through `openModal`: HeadlessUI detects a nested dialog through provide/inject, and
           `ModalHost` renders the modal stack as siblings — so a confirmation opened that way leaves this dialog's
           own outside-click and Escape handlers armed, and any click inside the confirmation dismisses this one. -->
      <StopSharingConfirmationModal
        v-if="confirmingStopSharing"
        @confirm="confirmStopSharing"
        @close="confirmingStopSharing = false"
      />
    </div>

    <template #actions="{ close }">
      <!-- `isPersistent` covers Esc, the backdrop and the header X; this button needs its own guard. -->
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
        @click="requestSave(close)"
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
import StopSharingConfirmationModal from "./stop-sharing-confirmation-modal.vue";
import type { IWishlistSharingScopeControlsType } from "../composables/useWishlistSharingScopes";
import type { SharingTargetType, WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list: WishlistType;
}

const props = defineProps<IProps>();

// The registry keys scopes by raw string; core's enum is one of those strings.
const PRIVATE_SCOPE: string = WishlistScopeType.Private;

const { t } = useI18n();

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard();
const notifications = useNotifications();

const listSharingScope = computed<string>(() => props.list.sharingSetting?.scope ?? WishlistScopeType.Private);
// Resolved by the module owning the scope; empty for anyone but the list's owner.
const listTargets = computed<SharingTargetType[]>(() => props.list.sharingSetting?.targets ?? []);
const listMessage = computed<string>(() => props.list.sharingSetting?.message ?? "");

// `autoRefetch: false`: the composable rethrows a refetch failure, which would read as a failed save. Refreshed below.
const { updateWishlist, fetchWishlists } = useWishlists({ autoRefetch: false });
const { sharingScopes, getSharingScope, isSharingScopeAvailable } = useWishlistSharingScopes();

// Own flag rather than `useWishlists`' shared `loading`, which can leak true on error.
const saving = ref(false);

const sharingScope = ref<string>(listSharingScope.value);

const scopeControls = useTemplateRef<IWishlistSharingScopeControlsType>("scopeControls");

const listSharingScopes = computed(() => {
  const available = sharingScopes.value.filter(isSharingScopeAvailable);

  // A scope the list already carries stays listed even when it isn't on offer, or saving would silently rewrite it.
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
    icon: scope.icon,
  }));
});

const activeScope = computed(() => getSharingScope(sharingScope.value));
// Such a scope stays listed but must not offer its controls.
const activeScopeElement = computed(() =>
  activeScope.value && isSharingScopeAvailable(activeScope.value) ? activeScope.value.element : undefined,
);
const listSharingScopeSupportsLink = computed(() => !!activeScope.value?.supportsLink);
const sharingKey = computed(() => props.list.sharingSetting?.id ?? crypto.randomUUID());
const sharingLink = computed(() => `${location.protocol}//${location.host}/shared-list/${sharingKey.value}`);

const scopeCanSave = computed(() => (activeScopeElement.value ? !!scopeControls.value?.canSave : true));
const scopeDirty = computed(() => !!scopeControls.value?.dirty);
const scopeChanged = computed(() => sharingScope.value !== listSharingScope.value);

const canSave = computed<boolean>(() => scopeCanSave.value && (scopeChanged.value || scopeDirty.value));

// Only leaving a sharing scope revokes an audience; a first share takes nothing away, and swapping recipients
// inside one scope is not a revocation.
const revokesCurrentAudience = computed(() => listSharingScope.value !== PRIVATE_SCOPE && scopeChanged.value);

const confirmingStopSharing = ref(false);
let pendingClose: (() => void) | undefined;

function requestSave(closeHandle: () => void): void {
  if (!canSave.value || saving.value) {
    return;
  }

  if (!revokesCurrentAudience.value) {
    void save(closeHandle);

    return;
  }

  pendingClose = closeHandle;
  confirmingStopSharing.value = true;
}

function confirmStopSharing(): void {
  confirmingStopSharing.value = false;

  const closeHandle = pendingClose;
  pendingClose = undefined;

  if (closeHandle) {
    void save(closeHandle);
  }
}

async function save(closeHandle: () => void): Promise<void> {
  if (!canSave.value || saving.value) {
    return;
  }

  saving.value = true;
  try {
    // Sharing only: name and description belong to the rename dialog. A scope without controls contributes nothing.
    await updateWishlist({
      listId: props.list.id,
      scope: sharingScope.value,
      sharingKey: sharingKey.value,
      ...(scopeControls.value?.payload ?? {}),
    });

    // Saved from here on, so neither step may surface as a save error; both are awaited to keep the loader up.
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
    // The mutation already logs; surface a toast and let the user retry.
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

<style lang="scss">
.share-wishlist-modal {
  @apply space-y-4;

  &__scopes {
    @apply mt-2 grid grid-cols-2 gap-4;

    @media (min-width: theme("screens.md")) {
      @apply flex flex-wrap;
    }
  }

  &__scope {
    @apply min-w-0;
  }
}
</style>
