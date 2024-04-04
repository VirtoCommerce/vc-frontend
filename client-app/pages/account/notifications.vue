<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("shared.account.navigation.links.notifications") }}
    </VcTypography>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col divide-y lg:space-y-3 lg:divide-none">Sceleton</div>
    <div v-else></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
const showUnreadOnly = ref(false);

const { loading } = usePushMessages(showUnreadOnly);
</script>

<style scoped lang="scss"></style>
