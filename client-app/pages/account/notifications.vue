<template>
  <div class="!block">
    <div class="flex items-start justify-between gap-3">
      <VcTypography tag="h1" class="flex items-center gap-2">
        {{ $t("shared.account.navigation.links.notifications") }}

        <VcBadge v-if="unreadCountWithHidden > 0" variant="outline" size="lg" rounded>
          {{ unreadCountWithHidden }}
        </VcBadge>
      </VcTypography>

      <VcDropdownMenu placement="bottom-end" width="max-content">
        <template #trigger>
          <VcButton
            :aria-label="$t('common.buttons.toggle_dropdown')"
            icon="dots-vertical"
            variant="outline"
            size="sm"
          />
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

    <div class="mt-4 lg:mt-5">
      <VcSwitch
        v-model="showUnreadOnly"
        :aria-label="$t('ui_kit.push-messages.show_unread_only')"
        label-position="right"
      >
        {{ $t("ui_kit.push-messages.show_unread_only") }}
      </VcSwitch>
    </div>

    <VcWidget size="lg" class="mt-4 lg:mt-5">
      <template #default-container>
        <VcEmptyView
          v-if="totalCount === 0 && !loading"
          :text="$t('pages.account.notifications.empty_list')"
          icon="thin-notifications"
        />

        <div v-else class="p-3 lg:p-6">
          <div class="divide-y rounded border empty:hidden">
            <PushMessage
              v-for="item in items"
              :key="item.id"
              size="lg"
              class="first:rounded-t last:rounded-b"
              :push-message="item"
            />
          </div>

          <p v-if="page >= PAGE_LIMIT" class="my-3 text-center">{{ $t("ui_kit.reach_limit.page_limit") }}</p>

          <VcPagination
            v-if="items.length && pages > 1"
            :page="page"
            :pages="Math.min(pages, PAGE_LIMIT)"
            class="mt-6"
            @update:page="changePage"
          />
        </div>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { usePushMessages } from "@/shared/push-messages/composables/usePushMessages";
import PushMessage from "@/shared/push-messages/components/push-message.vue";
const { t } = useI18n();

const showUnreadOnly = useLocalStorage<boolean>("showUnreadOnly_pushMessages_history", false);

watch(showUnreadOnly, resetPagination);

const { items, markReadAll, markUnreadAll, totalCount, unreadCountWithHidden, loading, pages, page } = usePushMessages({
  showUnreadOnly,
  withHidden: true,
});

usePageHead({
  title: t("pages.account.notifications.meta.title"),
});

function resetPagination() {
  changePage(1);
}

function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>
