<template>
  <div class="vc-copy-text">
    <div v-if="$slots.default">
      <slot />
    </div>

    <VcButton
      v-if="isSupported"
      :aria-label="$t('ui_kit.buttons.copy')"
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

<style scoped lang="scss">
.vc-copy-text {
  @apply flex items-center gap-1.5;
}
</style>
