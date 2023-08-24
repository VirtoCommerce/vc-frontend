<template>
  <p class="text-center md:py-10">
    {{ $t("shared.payment.manual.text") }}
    <ContactAdministratorLink />.
  </p>
</template>

<script setup lang="ts">
import { ContactAdministratorLink } from "@/shared/common";
</script>
