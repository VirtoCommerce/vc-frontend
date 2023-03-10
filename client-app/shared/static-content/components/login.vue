<template>
  <LoginForm />
</template>

<script setup lang="ts">
import { LoginForm } from "@/shared/login";

// eslint-disable-next-line vue/define-props-declaration
defineProps({
  model: {
    type: Object,
    required: true,
  },

  settings: {
    type: Object,
    required: true,
  },
});
</script>
