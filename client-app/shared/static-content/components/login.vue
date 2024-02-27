<template>
  <LoginFormSection />
</template>

<script setup lang="ts">
import LoginFormSection from "@/shared/layout/components/login-form-section/login-form-section.vue";

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}>();
</script>
