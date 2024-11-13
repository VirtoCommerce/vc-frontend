<template>
  <VcPushMessage :size="size" :push-message="_pushMessage" @click="toggleRead" />
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { usePushMessage } from "../composables/usePushMessage";
import type { VcPushMessageType } from "@/modules/push-messages/types";
import VcPushMessage from "@/modules/push-messages/components/vc-push-message.vue";

interface IProps {
  pushMessage: VcPushMessageType;
  size?: "md" | "lg";
}

const props = defineProps<IProps>();

const { pushMessage: _pushMessage } = toRefs(props);

const { toggleRead } = usePushMessage(_pushMessage);
</script>
