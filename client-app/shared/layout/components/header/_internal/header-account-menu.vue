<template>
  <Teleport to="body">
    <VcLoaderOverlay v-if="reverting" fixed-spinner data-test-id="back-to-operator-loader">
      {{ $t("shared.layout.header.top_header.switching_back") }}
    </VcLoaderOverlay>
  </Teleport>

  <VcPopover
    class="header-account-menu"
    placement="bottom-end"
    :offset-options="10"
    role="dialog"
    :aria-label="$t('shared.layout.header.top_header.account_menu_label')"
    bg-color="--color-additional-50"
    lazy
    shadow
  >
    <template #trigger="{ opened, triggerProps }">
      <button
        type="button"
        class="header-account-menu__trigger"
        :class="{ 'header-account-menu__trigger--opened': opened }"
        :aria-label="$t('shared.layout.header.top_header.account_menu_label')"
        data-test-id="account-button"
        v-bind="triggerProps"
      >
        {{ initials }}
      </button>
    </template>

    <template #content="{ close }">
      <HeaderAccountMenuPanel
        :display-name="displayName"
        :initials="initials"
        @navigate="close"
        @sign-out="signMeOut"
        @back-to-operator="onBackToOperator(close)"
      />
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useImpersonate, useSignMeOut, useUser } from "@/shared/account";
import HeaderAccountMenuPanel from "./header-account-menu-panel.vue";

const { user } = useUser();
const { signMeOut } = useSignMeOut();
const { reverting, backToOperator } = useImpersonate();

const displayName = computed(() => user.value.contact?.fullName || user.value.userName);

const initials = computed(() =>
  displayName.value
    .replace(/(\p{L})\p{L}*/gu, "$1")
    .replace(/\P{L}/gu, "")
    .slice(0, 2)
    .toUpperCase(),
);

async function onBackToOperator(close: () => void): Promise<void> {
  close();
  await backToOperator();
}
</script>

<style lang="scss">
.header-account-menu {
  &__trigger {
    @apply grid size-[42px] flex-none cursor-pointer place-items-center rounded-full border-0 text-sm font-bold;

    @apply font-geologica tracking-wide;

    background: color-mix(in srgb, var(--header-bottom-text-color) 12%, transparent);
    color: var(--header-bottom-text-color);
    // `--transition-duration` is declared nowhere in the repo, and a bare var() with no fallback
    // makes the whole declaration invalid — without this the trigger snapped instead of fading.
    transition:
      background var(--transition-duration, 0.2s) ease,
      color var(--transition-duration, 0.2s) ease;

    &:hover {
      background: color-mix(in srgb, var(--header-bottom-text-color) 20%, transparent);
    }

    &--opened {
      background: var(--header-bottom-text-color);
      color: var(--header-bottom-bg-color);
    }
  }
}
</style>
