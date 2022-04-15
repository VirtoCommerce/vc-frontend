<template>
  <div
    v-if="isLoyaltyCalculated"
    class="text-center text-sm font-bold text-green-800 border rounded-sm border-green-800"
  >
    <span v-t="'shared.account.loyalty.loyalty_calculated'"> </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isLoyaltyCalculated: {
    type: Boolean,
    default: false,
  },
});
</script>
