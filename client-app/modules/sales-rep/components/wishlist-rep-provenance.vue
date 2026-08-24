<template>
  <VcAlert color="info" variant="soft" size="sm" icon class="wishlist-rep-provenance">
    {{ t("sales_rep.list_sharing.badge") }}
  </VcAlert>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
