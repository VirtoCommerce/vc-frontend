<template>
  <LoginForm />
</template>

<script setup lang="ts">
import { LoginForm } from "@/shared/login";

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}>();
</script>
