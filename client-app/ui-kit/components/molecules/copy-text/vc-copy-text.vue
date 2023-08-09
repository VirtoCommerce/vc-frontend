<template>
  <div class="flex items-center">
    <slot />
    <VcButton
      v-if="isSupported"
      :class="{ 'ml-1.5': $slots.default }"
      size="xs"
      variant="outline"
      icon="document-duplicate"
      color="secondary"
      @click="copyText"
    />
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { useNotifications } from "@/shared/notification";

interface IProps {
  text: string;
  notification: string;
}
const props = defineProps<IProps>();

const { copy, isSupported } = useClipboard();
const notifications = useNotifications();

const copyText = async () => {
  await copy(props.text);
  notifications.success({
    text: props.notification,
    duration: 4000,
    single: true,
  });
};
</script>
