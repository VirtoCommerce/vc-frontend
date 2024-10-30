<template>
  <TwoColumn>
    <template #left>
      <VcWidget :title="$t('common.labels.handle_xapi_graphql_error')">
        <VcButton @click="sendRequest">
          {{ $t("common.buttons.send_request") }}
        </VcButton>
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
