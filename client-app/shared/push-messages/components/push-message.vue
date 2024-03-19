<template>
  <VcPushMessage :push-message="_pushMessage" @click="toggleRead" />
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { usePushMessage } from "@/shared/push-messages/composables/usePushMessage";

interface IProps {
  pushMessage: VcPushMessageType;
}

const props = defineProps<IProps>();

const { pushMessage: _pushMessage } = toRefs(props);

const { toggleRead } = usePushMessage(_pushMessage);
</script>
