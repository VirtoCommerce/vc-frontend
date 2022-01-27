<template>
  <div></div>
</template>

<script setup lang="ts">
import { useUserCheckoutDefaults } from "@/shared/account";

const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();
</script>
