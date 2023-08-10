<template>
  <div class="vc-copy-text">
    <slot />
    <VcButton
      v-if="isSupported"
      class="vc-copy-text__button"
      :class="{ 'vc-copy-text__button--space': $slots.default }"
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
  @apply flex items-center;

  &__button {
    &--space {
      @apply ml-1.5;
    }
  }
}
</style>
