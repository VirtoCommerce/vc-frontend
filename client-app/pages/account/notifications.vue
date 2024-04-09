<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("shared.account.navigation.links.notifications") }}
    </VcTypography>

    <div class="flex justify-between">
      <VcSwitch v-model="showUnreadOnly" label-position="right">
        {{ $t("ui_kit.push-messages.show_unread") }}
      </VcSwitch>

      <VcDropdownMenu placement="bottom-end">
        <template #trigger>
          <VcButton icon="dots-vertical" variant="outline" size="sm" />
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
      <PushMessage v-for="item in items" :key="item.id" size="lg" class="border-b" :push-message="item" />

      <VcPagination
        v-if="items.length && pages > 1"
        :page="page"
        :pages="pages"
        class="self-start"
        :class="[isMobile ? 'px-6 py-10' : 'mt-5 px-5 pb-5']"
        @update:page="changePage"
      />
    </div>
    <div v-if="totalCount === 0 && !loading">
      <div class="mb-1 font-bold">
        {{ $t("ui_kit.push-messages.empty.title") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref } from "vue";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
import PushMessage from "@/shared/push-messages/components/push-message.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
const showUnreadOnly = ref(false);

const { items, markReadAll, markUnreadAll, totalCount, loading, pages, page } = usePushMessages({
  showUnreadOnly,
  withHidden: true,
});

function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
