<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("shared.account.navigation.links.notifications") }}
    </VcTypography>
    <VcWidget>
      <VcTable hide-default-header :items="items" :loading="loading">
        <template #desktop-body>
          <tr v-for="item in items" :key="item.id" class="border-y" :class="{ 'bg-info-50': !item.isRead }">
            <td class="w-7 py-6 pl-4 pr-1">
              <div class="flex align-middle">
                <VcBadge v-if="!item.isRead" color="info" rounded />
              </div>
            </td>
            <VcMarkdownRender :src="item.shortMessage" class="py-6" />
            <td class="w-24 px-4 py-6">
              {{ $d(item.createdDate) }}
            </td>
          </tr>
        </template>
      </VcTable>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";

const showUnreadOnly = ref(false);

const { loading, items } = usePushMessages(showUnreadOnly);
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}

.vc-widget__slot {
  @apply p-0;
}
</style>
