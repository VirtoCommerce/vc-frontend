<template>
  <VcEmptyPage class="awaiting-approval" image="lock.jpg" icon="outline-security">
    <VcTypography tag="h1" class="awaiting-approval__title">
      {{ $t("pages.awaiting_approval.title") }}
    </VcTypography>

    <VcTypography class="awaiting-approval__message">
      {{ $t("pages.awaiting_approval.message") }}
    </VcTypography>

    <VcButton
      class="awaiting-approval__sign-out"
      variant="outline"
      data-test-id="awaiting-approval-sign-out-button"
      @click="signMeOut"
    >
      {{ $t("shared.layout.header.link_logout") }}
    </VcButton>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeOut, useUser } from "@/shared/account";

const { t } = useI18n();
const router = useRouter();
const { signMeOut } = useSignMeOut();
const { fetchUser, isAuthenticated, isAwaitingApproval } = useUser();

// The approval happens in the admin, so ask again whenever the customer comes back to this tab.
function refreshUser(): void {
  if (document.visibilityState === "visible") {
    void fetchUser();
  }
}

useEventListener(document, "visibilitychange", refreshUser);
useEventListener(window, "focus", refreshUser);

// Once approved (here, or by a user reload from another tab), a full load: the catalog menu is fetched at boot only.
// Signing out also ends "awaiting", but that is not an approval.
watch(isAwaitingApproval, (awaiting) => {
  if (!awaiting && isAuthenticated.value) {
    window.location.href = router.resolve({ name: ROUTES.CATALOG.NAME }).href;
  }
});

usePageHead({
  title: computed(() => t("pages.awaiting_approval.meta.title")),
});
</script>

<style lang="scss">
.awaiting-approval {
  &__title {
    @apply order-first mb-5;

    @media (width >= theme("screens.sm")) {
      @apply pe-8;
    }

    @media (width >= theme("screens.lg")) {
      @apply pe-16;
    }
  }

  &__message {
    @media (width >= theme("screens.sm")) {
      @apply pe-8;
    }

    @media (width >= theme("screens.lg")) {
      @apply pe-16;
    }
  }

  &__sign-out {
    @apply mt-6;
  }
}
</style>
