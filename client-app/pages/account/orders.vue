<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.orders.title") }}
    </VcTypography>

    <Orders />
  </div>
</template>

<script setup lang="ts">
import { Orders } from "@/shared/account";
</script>
