<template>
  <VcAlert color="info" variant="solid-light" size="sm" icon class="wishlist-rep-provenance">
    {{ t("sales_rep.list_sharing.badge") }}
  </VcAlert>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Rendered through the `sharedList` extension point; whether this list came from a rep is decided by the registered
// condition, so the component itself has nothing to check.
const { t } = useI18n();
</script>
