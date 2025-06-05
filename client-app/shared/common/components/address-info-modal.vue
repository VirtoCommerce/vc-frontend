<template>
  <VcModal :title="title" max-width="40rem">
    {{ info }}
    <template #actions="{ close }">
      <GetDirectionsAction size="md" />

      <VcButton @click="close">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GetDirectionsAction from "./get-directions-action.vue";

interface IProps {
  info: string;
}

defineProps<IProps>();
const title = computed(() => "Pick point info");
</script>
