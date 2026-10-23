<template>
  <div class="security">
    <VcTypography tag="h1">
      {{ $t("pages.account.security.title") }}
    </VcTypography>

    <ExtensionPoint
      v-for="signInMethod in extendedSignInMethods"
      :key="signInMethod.name"
      category="signInMethods"
      :name="signInMethod.name"
    >
      <template #default="{ extensionProps }">
        <VcWidget :title="getTitle(signInMethod, extensionProps)" size="lg">
          <template v-if="signInMethod.canCreateKey && extensionProps?.createKey" #append>
            <VcButton
              prepend-icon="plus"
              size="sm"
              :loading="toValue(extensionProps.creating)"
              @click="extensionProps.createKey"
            >
              {{ toValue(extensionProps.createKeyText) }}
            </VcButton>
          </template>

          <p v-if="extensionProps?.description" class="security__description">
            {{ toValue(extensionProps.description) }}
          </p>

          <ul v-if="signInMethod.keys?.length" class="security__keys">
            <li v-for="key in signInMethod.keys" :key="key.id" class="security__key">
              <VcIcon class="security__key-icon" :name="extensionProps?.getKeyIcon?.(key) ?? 'key'" />

              <div class="security__key-info">
                <div class="security__key-name">
                  {{ key.name || $t("pages.account.security.unnamed_key") }}
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
                :aria-label="$t('common.buttons.edit')"
                @click="openRenameModal(signInMethod, key)"
              />

              <VcButton
                v-if="signInMethod.canDeleteKey"
                icon="trash"
                variant="ghost"
                color="neutral"
                size="sm"
                :aria-label="$t('common.buttons.delete')"
                @click="openDeleteModal(signInMethod, key)"
              />
            </li>
          </ul>

          <p v-else-if="!loading" class="security__empty">
            {{ toValue(extensionProps?.noKeysText) || $t("pages.account.security.no_keys") }}
          </p>
        </VcWidget>
      </template>
    </ExtensionPoint>
  </div>
</template>

<script setup lang="ts">
import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useSignInMethods } from "@/shared/account";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { useModal } from "@/shared/modal";
import { VcConfirmationModal } from "@/ui-kit/components";
import type { GetSignInMethodsQuery, SignInKeyType } from "@/core/api/graphql/types";
import type { SignInMethodContributionType } from "@/shared/account/types";
import RenameSignInKeyModal from "@/shared/account/components/rename-sign-in-key-modal.vue";

type SignInMethodType = NonNullable<GetSignInMethodsQuery["signInMethods"]>[number];

const { t, d } = useI18n();
const { openModal, closeModal } = useModal();
const { getContribution } = useExtensionRegistry();
const { signInMethods, loading, renaming, deleting, renameKey, deleteKey } = useSignInMethods();

usePageHead({ title: computed(() => t("pages.account.security.title")) });

const extendedSignInMethods = computed(() =>
  signInMethods.value.filter((signInMethod) => getContribution("signInMethods", signInMethod.name)),
);

function getTitle(signInMethod: SignInMethodType, contribution?: SignInMethodContributionType): string {
  return toValue(contribution?.title) || signInMethod.displayName || signInMethod.name;
}

function getKeyDetails(key: SignInKeyType, contribution?: SignInMethodContributionType): string {
  const details = [...(contribution?.getKeyDetails?.(key) ?? [])];

  if (key.createdDate) {
    details.push(
      t("pages.account.security.created", {
        date: d(key.createdDate, { dateStyle: "short", timeStyle: "short" }),
      }),
    );
  }

  return details.join(" · ");
}

function openRenameModal(signInMethod: SignInMethodType, key: SignInKeyType): void {
  openModal({
    component: RenameSignInKeyModal,
    props: {
      initialName: key.name,
      loading: renaming,
      async onSave(name: string) {
        if (await renameKey(signInMethod.name, key.id, name)) {
          closeModal();
        }
      },
    },
  });
}

function openDeleteModal(signInMethod: SignInMethodType, key: SignInKeyType): void {
  openModal({
    component: VcConfirmationModal,
    props: {
      loading: deleting,
      variant: "danger",
      icon: "delete-2",
      title: t("pages.account.security.delete_modal.title"),
      text: t("pages.account.security.delete_modal.message"),
      async onConfirm() {
        await deleteKey(signInMethod.name, key.id);
        closeModal();
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
