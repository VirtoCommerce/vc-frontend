<template>
  <VcPopup variant="warn" is-persistent>
    <template #actions="{ close }">
      <VcButton class="uppercase mx-auto inline-flex px-10" @click="close">
        {{ $t("shared.wishlists.unsuccessful_create_wishlist_dialog.ok_button") }}
      </VcButton>
    </template>
    <div class="text-center px-5 py-10">
      <span class="text-lg" v-t="'shared.wishlists.unsuccessful_create_wishlist_dialog.message'"></span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup, VcButton } from "@/components";
</script>
