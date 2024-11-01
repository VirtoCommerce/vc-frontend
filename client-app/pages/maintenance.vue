<template>
  <TwoColumn>
    <template #left>
      <VcWidget title="Handle xAPI GraphQL error">
        <VcButton @click="sendRequest">Send request</VcButton>
      </VcWidget>
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { addItemToCart } from "@/core/api/graphql";
import { TwoColumn } from "@/shared/layout";

function sendRequest(): void {
  void addItemToCart("some_product_id", 9999999999);
}
</script>
