<template>
  <div>
    <VcTypography tag="h1" class="lg:hidden">
      {{ $t("pages.account.dashboard.title") }}
    </VcTypography>

    <!-- Above the layout, not a block of it: it renders nothing without invitations, and invitations the user has to
         act on must not be hideable. -->
    <PendingInvitesWidget />

    <LayoutSurface :layout="layout" :cards="cards" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { PendingInvitesWidget } from "@/shared/account";
// By path, like the surface: the barrel is loaded with the app, and the cards' query belongs to this page's chunk.
import { useAccountDashboard } from "@/shared/account/composables/useAccountDashboard";
import { LAYOUT_SCOPES, useLayout } from "@/shared/dashboard";
import LayoutSurface from "@/shared/dashboard/components/layout-surface.vue";

const { t } = useI18n();

usePageHead({
  title: t("pages.account.dashboard.meta.title"),
});

// The page owns the layout: the surface renders it, and the statistics query is shaped from it.
const layout = useLayout(LAYOUT_SCOPES.accountDashboard);
const { cards } = useAccountDashboard(layout);
</script>
