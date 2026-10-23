<template>
  <VcRecordCard :class="['push-message-card', { 'push-message-card--unread': !pushMessage.isRead }]" :meta="meta">
    <template #lead>
      <VcBadge :color="pushMessage.isRead ? 'neutral' : 'accent'" size="xs" rounded />
    </template>

    <template #title>
      <VcMarkdownRender class="push-message-card__message" :src="pushMessage.shortMessage" />
    </template>

    <template #menu="{ close }">
      <VcMenuItem
        color="secondary"
        nowrap
        @click="
          close();
          toggleRead();
        "
      >
        <template #prepend>
          <VcIcon :name="pushMessage.isRead ? 'mail' : 'mail-open'" />
        </template>

        <span>{{ pushMessage.isRead ? $t("push_messages.mark_as_unread") : $t("push_messages.mark_as_read") }}</span>
      </VcMenuItem>
    </template>
  </VcRecordCard>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePushMessage } from "../composables/usePushMessage";
import type { PushMessageType } from "../types";

interface IProps {
  pushMessage: PushMessageType;
}

const props = defineProps<IProps>();

const { d } = useI18n();
const { toggleRead } = usePushMessage(toRef(props, "pushMessage"));

const meta = computed<VcRecordCardMetaItemType[]>(() => [
  { icon: "clock", text: d(props.pushMessage.createdDate, { key: "long", second: undefined }) },
]);
</script>

<style lang="scss">
.push-message-card {
  $unread: "";

  &--unread {
    $unread: &;
  }

  &__message {
    @apply line-clamp-2 text-sm font-normal text-neutral-950;

    #{$unread} & {
      @apply font-bold;
    }
  }
}
</style>
