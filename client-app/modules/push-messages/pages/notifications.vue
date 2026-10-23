<template>
  <div class="!block">
    <div class="flex items-start justify-between gap-3">
      <VcTypography tag="h1" class="flex items-center gap-2">
        {{ $t("push_messages.title") }}

        <VcBadge v-if="unreadCountWithHidden > 0" variant="outline" size="lg" rounded>
          {{ unreadCountWithHidden }}
        </VcBadge>
      </VcTypography>

      <VcDropdownMenu placement="bottom-end" width="max-content">
        <template #trigger="{ triggerProps }">
          <VcButton
            :aria-label="$t('common.buttons.toggle_dropdown')"
            icon="dots-vertical"
            variant="outline"
            size="sm"
            v-bind="triggerProps"
          />
        </template>

        <template #content="{ close: closeMenu }">
          <VcMenuItem
            @click="
              closeMenu();
              markReadAll();
            "
          >
            {{ $t("push_messages.options.make_all_as_read") }}
          </VcMenuItem>

          <VcMenuItem
            @click="
              closeMenu();
              markUnreadAll();
            "
          >
            {{ $t("push_messages.options.make_all_as_unread") }}
          </VcMenuItem>
        </template>
      </VcDropdownMenu>
    </div>

    <div class="mt-4 lg:mt-5">
      <VcSwitch v-model="showUnreadOnly" :aria-label="$t('push_messages.show_unread_only')" label-position="right">
        {{ $t("push_messages.show_unread_only") }}
      </VcSwitch>
    </div>

    <VcWidget size="lg" class="mt-4 lg:mt-5" mobile-flat>
      <template #default-container>
        <VcEmptyView
          v-if="totalCount === 0 && !loading"
          :text="$t('push_messages.empty_list')"
          icon="outline-notifications"
        />

        <div v-else class="lg:p-6">
          <div v-if="isMobile" class="flex flex-col gap-3">
            <PushMessageCard v-for="item in items" :key="item.id" :push-message="item" />
          </div>

          <div v-else class="divide-y rounded-[--vc-radius] border empty:hidden">
            <PushMessage
              v-for="item in items"
              :key="item.id"
              size="lg"
              class="first:rounded-t-[inherit] last:rounded-b-[inherit]"
              :push-message="item"
            />
          </div>

          <p v-if="page >= PAGE_LIMIT" class="my-3 text-center">{{ $t("reach_limit.page_limit") }}</p>

          <VcPagination
            v-if="items.length && pages > 1"
            :page="page"
            :pages="Math.min(pages, PAGE_LIMIT)"
            class="mt-3 lg:mt-6"
            @update:page="changePage"
          />
        </div>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { BREAKPOINTS } from "@/ui-kit/constants";
import PushMessageCard from "../components/push-message-card.vue";
import PushMessage from "../components/push-message.vue";
import { usePushMessages } from "../composables/usePushMessages";
const { t } = useI18n();

const isMobile = useBreakpoints(BREAKPOINTS).smaller("lg");

const showUnreadOnly = useLocalStorage<boolean>("showUnreadOnly_pushMessages_history", false);

watch(showUnreadOnly, resetPagination);

const { items, markReadAll, markUnreadAll, totalCount, unreadCountWithHidden, loading, pages, page } = usePushMessages({
  showUnreadOnly,
  withHidden: true,
});

usePageHead({
  title: t("push_messages.title"),
});

function resetPagination() {
  changePage(1);
}

function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>
