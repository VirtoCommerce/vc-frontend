<template>
  <div class="!block">
    <div class="flex items-start justify-between gap-3">
      <VcTypography tag="h1" class="flex items-center gap-2">
        {{ $t("shared.account.navigation.links.notifications") }}

        <VcBadge v-if="unreadCountWithHidden > 0" variant="outline" size="lg" rounded>
          {{ unreadCountWithHidden }}
        </VcBadge>
      </VcTypography>

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

    <div class="mt-4 lg:mt-5">
      <VcSwitch v-model="showUnreadOnly" label-position="right">
        {{ $t("ui_kit.push-messages.show_unread_only") }}
      </VcSwitch>
    </div>

    <VcWidget size="lg" class="mt-4 lg:mt-5">
      <template #default-container>
        <div class="p-3 lg:p-6">
          <div class="divide-y rounded border empty:hidden">
            <PushMessage
              v-for="item in items"
              :key="item.id"
              size="lg"
              class="first:rounded-t last:rounded-b"
              :push-message="item"
            />
          </div>

          <VcPagination
            v-if="items.length && pages > 1"
            :page="page"
            :pages="pages"
            class="mt-6"
            @update:page="changePage"
          />

          <VcEmptyView
            v-if="totalCount === 0 && !loading"
            class="min-h-[20rem]"
            :text="$t('pages.account.notifications.empty_list')"
          >
            <template #icon>
              <VcImage
                src="/static/images/common/notifications.svg"
                :alt="$t('pages.account.notifications.empty_list')"
              />
            </template>
          </VcEmptyView>
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
