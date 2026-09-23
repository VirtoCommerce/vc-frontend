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
    // 34, not 42: the pod is the quietest control in the row and at 42 it read as the loudest.
    // Its type is the header's smallest step, the same 12.5 the locale pill takes, so the two
    // sit as a pair rather than as a pill beside a button.
    @apply grid size-[34px] flex-none cursor-pointer place-items-center rounded-full border-0 font-bold;

    @apply font-geologica;

    font-size: 0.78125rem;
    letter-spacing: 0.02em;
    // Palette steps rather than a tint of the band's ink: the tint rendered correctly in both
    // themes, but it moved with whatever the band happened to be painted, so the pod could not
    // be told to match the pill beside it. These are the steps the design names, and they flip
    // with the preset on their own.
    background: theme("colors.neutral.200");
    color: theme("colors.neutral.800");
    // `--transition-duration` is declared nowhere in the repo, and a bare var() with no fallback
    // makes the whole declaration invalid — without this the trigger snapped instead of fading.
    transition:
      background var(--transition-duration, 0.2s) ease,
      color var(--transition-duration, 0.2s) ease;

    &:hover {
      background: theme("colors.neutral.300");
    }

    &--opened {
      background: theme("colors.neutral.950");
      color: theme("colors.additional.50");
    }
  }
}
</style>
