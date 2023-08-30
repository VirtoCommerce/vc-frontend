<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between lg:mx-0">
      <h2 v-t="'pages.account.orders.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <Orders with-search with-pagination />
  </div>
</template>

<script setup lang="ts">
import { Orders } from "@/shared/account";
</script>
