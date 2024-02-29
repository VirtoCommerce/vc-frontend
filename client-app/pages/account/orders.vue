<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
      <h2 v-t="'pages.account.orders.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <Orders with-search with-pagination />
  </div>
</template>

<script setup lang="ts">
import { Orders } from "@/shared/account";
</script>
