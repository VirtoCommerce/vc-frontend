<template>
  <div class="security">
    <VcTypography tag="h1">
      {{ $t("pages.account.security.title") }}
    </VcTypography>

    <ExtensionPoint
      v-for="signInMethod in extendedSignInMethods"
      :key="signInMethod.name"
      :category="EXTENSION_CATEGORIES.signInMethods"
      :name="signInMethod.name"
    >
      <template #default="{ extensionProps }">
        <VcWidget :title="getTitle(signInMethod, extensionProps)" size="lg">
          <template v-if="signInMethod.canCreateKey && extensionProps?.createKey" #append>
            <VcButton
              :ref="createKeyButtonRef(signInMethod.name)"
              prepend-icon="plus"
              size="sm"
              :loading="toValue(extensionProps.creating)"
              data-test-id="create-sign-in-key-button"
              @click="createKey(signInMethod, extensionProps)"
            >
              {{ toValue(extensionProps.createKeyText) }}
            </VcButton>
          </template>

          <p v-if="extensionProps?.description" class="security__description">
            {{ toValue(extensionProps.description) }}
          </p>

          <ul
            v-if="signInMethod.keys?.length"
            :ref="keysAreaRef(signInMethod.name)"
            class="security__keys"
            tabindex="-1"
          >
            <li v-for="key in signInMethod.keys" :key="key.id" class="security__key">
              <VcIcon class="security__key-icon" :name="extensionProps?.getKeyIcon?.(key) ?? 'key'" />

              <div class="security__key-info">
                <div class="security__key-name">
                  {{ getKeyName(key) }}
                </div>

                <div class="security__key-details">
                  {{ getKeyDetails(key, extensionProps) }}
                </div>
              </div>

              <VcButton
                v-if="signInMethod.canRenameKey"
                icon="edit"
                variant="ghost"
                color="neutral"
                size="sm"
                :aria-label="$t('pages.account.security.rename_key_label', { name: getKeyName(key) })"
                @click="openRenameModal(signInMethod, key)"
              />

              <VcButton
                v-if="signInMethod.canDeleteKey"
                icon="trash"
                variant="ghost"
                color="neutral"
                size="sm"
                :aria-label="$t('pages.account.security.delete_key_label', { name: getKeyName(key) })"
                @click="openDeleteModal(signInMethod, key)"
              />
            </li>
          </ul>

          <p
            v-else-if="!loading"
            :ref="keysAreaRef(signInMethod.name)"
            class="security__empty"
            tabindex="-1"
            data-test-id="sign-in-keys-empty-label"
          >
            {{ toValue(extensionProps?.noKeysText) || $t("pages.account.security.no_keys") }}
          </p>
        </VcWidget>
      </template>
    </ExtensionPoint>

    <ExtensionPointList :category="EXTENSION_CATEGORIES.accountSecurity" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { useSignInMethods } from "@/shared/account";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_CATEGORIES } from "@/shared/common/constants/extensionPointsNames";
import { useModal } from "@/shared/modal";
import { VcConfirmationModal } from "@/ui-kit/components";
import type { GetSignInMethodsQuery, SignInKeyType } from "@/core/api/graphql/types";
import type { SignInMethodContributionType } from "@/shared/account/types";
import type { VcButton } from "@/ui-kit/components";
import type { ComponentPublicInstance } from "vue";
import RenameSignInKeyModal from "@/shared/account/components/rename-sign-in-key-modal.vue";

type SignInMethodType = NonNullable<GetSignInMethodsQuery["signInMethods"]>[number];

const { t, d } = useI18n();
const { openModal } = useModal();
const { themeContext } = useThemeContext();
const { getContribution } = useExtensionRegistry();
const { signInMethods, loading, renaming, deleting, refetch, renameKey, deleteKey } = useSignInMethods();

usePageHead({ title: computed(() => t("pages.account.security.title")) });

const createKeyButtons = new Map<string, InstanceType<typeof VcButton>>();
const keysAreas = new Map<string, HTMLElement>();

const extendedSignInMethods = computed(() =>
  signInMethods.value.filter(
    (signInMethod) =>
      themeContext.value.storeSettings.authenticationTypes.includes(signInMethod.name) &&
      getContribution(EXTENSION_CATEGORIES.signInMethods, signInMethod.name),
  ),
);

function getTitle(signInMethod: SignInMethodType, contribution?: SignInMethodContributionType): string {
  return toValue(contribution?.title) || signInMethod.displayName || signInMethod.name;
}

function createKeyButtonRef(name: string): (el: Element | ComponentPublicInstance | null) => void {
  return (el) => {
    if (el) {
      createKeyButtons.set(name, el as InstanceType<typeof VcButton>);
    } else {
      createKeyButtons.delete(name);
    }
  };
}

function keysAreaRef(name: string): (el: Element | ComponentPublicInstance | null) => void {
  return (el) => {
    if (el instanceof HTMLElement) {
      keysAreas.set(name, el);
    } else {
      keysAreas.delete(name);
    }
  };
}

// The control that started the action is disabled or removed by it, so focus would fall to the page body.
async function focusSignInMethod(name: string): Promise<void> {
  await nextTick();

  const createKeyButton = createKeyButtons.get(name);

  if (createKeyButton) {
    createKeyButton.focus();
  } else {
    keysAreas.get(name)?.focus();
  }
}

async function createKey(signInMethod: SignInMethodType, contribution: SignInMethodContributionType): Promise<void> {
  await contribution.createKey?.();
  await refetch();
  await focusSignInMethod(signInMethod.name);
}

function getKeyName(key: SignInKeyType): string {
  return key.name || t("pages.account.security.unnamed_key");
}

function getKeyDetails(key: SignInKeyType, contribution?: SignInMethodContributionType): string {
  const details = [...(contribution?.getKeyDetails?.(key) ?? [])];

  if (key.createdDate) {
    details.push(t("pages.account.security.created", { date: formatDate(key.createdDate) }));
  }

  if (key.modifiedDate) {
    details.push(t("pages.account.security.changed", { date: formatDate(key.modifiedDate) }));
  }

  return details.join(" · ");
}

function formatDate(date: string): string {
  return d(date, { dateStyle: "short", timeStyle: "short" });
}

function openRenameModal(signInMethod: SignInMethodType, key: SignInKeyType): void {
  const closeRenameModal = openModal({
    component: RenameSignInKeyModal,
    props: {
      initialName: key.name,
      loading: renaming,
      async onSave(name: string) {
        if (await renameKey(signInMethod.name, key.id, name)) {
          closeRenameModal();
        }
      },
    },
  });
}

function openDeleteModal(signInMethod: SignInMethodType, key: SignInKeyType): void {
  const closeDeleteModal = openModal({
    component: VcConfirmationModal,
    props: {
      loading: deleting,
      variant: "danger",
      icon: "delete-2",
      title: t("pages.account.security.delete_modal.title"),
      text: t("pages.account.security.delete_modal.message"),
      async onConfirm() {
        await deleteKey(signInMethod.name, key.id);
        closeDeleteModal();
        await focusSignInMethod(signInMethod.name);
      },
    },
  });
}
</script>

<style lang="scss">
.security {
  @apply space-y-5;

  &__description {
    @apply mb-4 text-sm text-neutral-600;
  }

  &__keys {
    @apply divide-y rounded border;
  }

  &__key {
    @apply flex items-center gap-3 px-4 py-3;
  }

  &__key-icon {
    @apply shrink-0 text-neutral-500;
  }

  &__key-info {
    @apply min-w-0 grow;
  }

  &__key-name {
    @apply truncate font-bold;
  }

  &__key-details {
    @apply text-sm text-neutral-600;
  }

  &__empty {
    @apply text-sm text-neutral-600;
  }
}
</style>
