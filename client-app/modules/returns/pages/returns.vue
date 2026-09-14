<template>
  <div>
    <!-- Title block -->
    <VcTypography tag="h1">{{ $t("returns.title") }}</VcTypography>

    <!-- Empty view -->
    <VcEmptyView v-if="!loading && !returns.length" :text="$t('returns.no_returns_message')" icon="outline-order" />

    <!-- Content block -->
    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="loading"
          :columns="columns"
          :sort="sort"
          :items="returns"
          :pages="pages"
          :page="page"
          :description="$t('returns.meta.table_description')"
          @item-click="goToReturn"
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #mobile-item="itemData">
            <div
              class="grid cursor-pointer grid-cols-2 gap-y-4 border-b border-neutral-200 p-6"
              role="button"
              tabindex="0"
              @click="goToReturn(itemData.item)"
              @keyup.enter="goToReturn(itemData.item)"
            >
              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.number") }}</span>

                <span class="overflow-hidden text-ellipsis pr-4 font-black">{{ itemData.item.number }}</span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.date") }}</span>

                <span class="overflow-hidden text-ellipsis">{{ $d(new Date(itemData.item.createdDate)) }}</span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.status") }}</span>

                <span class="overflow-hidden text-ellipsis">{{ itemData.item.status }}</span>
              </div>

              <div class="flex flex-col">
                <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.quantity") }}</span>

                <span class="overflow-hidden text-ellipsis">{{ itemData.item.itemsQuantity }}</span>
              </div>
            </div>
          </template>

          <template #desktop-body>
            <tr
              v-for="item in returns"
              :key="item.id"
              class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
              @click="goToReturn(item)"
            >
              <td class="overflow-hidden text-ellipsis p-5">{{ item.number }}</td>

              <td class="overflow-hidden text-ellipsis p-5">{{ $d(new Date(item.createdDate)) }}</td>

              <td class="overflow-hidden text-ellipsis p-5">{{ item.status }}</td>

              <td class="overflow-hidden text-ellipsis p-5 text-right">{{ item.itemsQuantity }}</td>
            </tr>
          </template>
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables/usePageHead";
import { Sort } from "@/core/types";
import { useReturns } from "@/modules/returns/composables/useReturns";
import type { ISortInfo } from "@/core/types";

const { t } = useI18n();
const router = useRouter();

usePageHead({
  title: t("returns.meta.title"),
});

const { loading, returns, pages, page, sort } = useReturns();

const columns = ref<VcTableColumnType[]>([
  { id: "number", title: t("returns.list.columns.number"), sortable: true },
  { id: "createdDate", title: t("returns.list.columns.date"), sortable: true },
  { id: "status", title: t("returns.list.columns.status"), sortable: true },
  { id: "itemsQuantity", title: t("returns.list.columns.quantity"), align: "right" },
]);

function applySorting(sortInfo: ISortInfo): void {
  sort.value = new Sort(sortInfo.column, sortInfo.direction);
  page.value = 1;
}

function goToReturn(payload: { id: string }): void {
  void router.push({ name: "Return", params: { returnId: payload.id } });
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>
