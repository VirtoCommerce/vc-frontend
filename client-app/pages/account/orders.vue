<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.orders.title") }}
    </VcTypography>

    <Orders with-search with-pagination />
  </div>
</template>

<script setup lang="ts">
import { Orders } from "@/shared/account";
</script>
