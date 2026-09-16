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
            <button
              type="button"
              class="grid w-full cursor-pointer appearance-none grid-cols-2 gap-y-4 border-b border-neutral-200 p-6 text-left"
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
            </button>
          </template>

          <template #desktop-body>
            <tr
              v-for="item in returns"
              :key="item.id"
              class="cursor-pointer even:bg-neutral-50 hover:bg-neutral-200"
              tabindex="0"
              @click="goToReturn(item)"
              @keyup.enter="goToReturn(item)"
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
import { RETURN_ACTION } from "@/modules/returns/constants";
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

type ReturnListItemType = {
  id: string;
  availableActions?: { name: string; isAvailable: boolean }[];
};

/**
 * A draft goes back to where it was left off, anything else to the read-only page.
 *
 * Which one it is comes from the server's own list of actions rather than from the status, so the
 * rule stays in the module's transition table.
 */
function goToReturn(payload: ReturnListItemType): void {
  const editable = payload.availableActions?.some((action) => action.name === RETURN_ACTION.EDIT && action.isAvailable);

  void router.push(
    editable
      ? { name: "EditReturn", params: { returnId: payload.id } }
      : { name: "Return", params: { returnId: payload.id } },
  );
}

function changePage(newPage: number): void {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
}
</script>
