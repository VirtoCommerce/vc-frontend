<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("shared.account.navigation.links.notifications") }}
    </VcTypography>
    <div class="flex justify-between">
      <VcSwitch v-model="unreadVisibility" class="mr-1">
        {{ $t("ui_kit.push-messages.show_unread_only") }}
      </VcSwitch>
      <VcDropdownMenu placement="bottom-end">
        <template #trigger>
          <VcIcon class="vc-push-messages__options-icon" name="dots-vertical" size="sm" />
        </template>

        <template #content="{ close: closeMenu }">
          <VcMenuItem
            @click="
              closeMenu();
              markReadAll();
            "
          >
            {{ $t("ui_kit.push-messages.options.make_all_as_read") }}
          </VcMenuItem>

          <VcMenuItem
            @click="
              closeMenu();
              markUnreadAll();
            "
          >
            {{ $t("ui_kit.push-messages.options.make_all_as_unread") }}
          </VcMenuItem>
        </template>
      </VcDropdownMenu>
    </div>
    <div>
      <PushMessage v-for="item in items" :key="item.id" class="border-b" :push-message="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
import PushMessage from "@/shared/push-messages/components/push-message.vue";

const unreadVisibility = ref(false);

const { items, markReadAll, markUnreadAll } = usePushMessages(unreadVisibility);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
