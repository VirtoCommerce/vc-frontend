<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.members.title'" />
      <div v-if="!isMobile" class="space-x-4">
        <VcButton :is-disabled="true" class="uppercase p-4" is-outline>
          {{ $t("pages.company.members.buttons.invite_members") }}
        </VcButton>
        <VcButton :is-disabled="true" class="uppercase p-4" is-outline>
          {{ $t("pages.company.members.buttons.add_new_member") }}
        </VcButton>
      </div>
      <div v-else class="flex flex-no-wrap space-x-2">
        <VcButton :is-disabled="true" class="uppercase p-4" is-outline>
          {{ $t("pages.company.members.buttons.new") }}
        </VcButton>
        <VcButton :is-disabled="true" class="uppercase p-4" is-outline>
          {{ $t("pages.company.members.buttons.invite") }}
        </VcButton>
      </div>
    </div>

    <!-- Search & filters block -->
    <div class="flex gap-x-2 lg:gap-x-5 lg:flex-row-reverse">
      <div class="relative ml-5 md:mx-0">
        <VcButton
          ref="filterButtonElement"
          :is-disabled="true"
          is-outline
          size="lg"
          class="p-4 w-11 lg:w-auto uppercase"
        >
          <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
          <span class="lg:hidden fa fa-filter"></span>
        </VcButton>
      </div>

      <div class="flex flex-grow mr-5 md:mx-0">
        <div class="relative grow">
          <input
            v-model.trim="keyword"
            :disabled="loading"
            :placeholder="$t('pages.company.members.search_placeholder')"
            class="appearance-none bg-white rounded rounded-r-none h-11 px-4 font-medium outline-none text-sm border w-full border-gray-300 focus:border-gray-400 disabled:bg-gray-200"
            @keypress.enter="searchContacts"
          />

          <button v-if="keyword" class="absolute right-[14px] top-[14px]" @click="resetKeyword">
            <svg class="text-[color:var(--color-primary)]" height="14" width="14">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton :is-disabled="loading" class="px-4 uppercase !rounded-l-none" size="lg" @click="searchContacts">
          <i class="fas fa-search text-lg" />
        </VcButton>
      </div>
    </div>

    <!-- Empty view -->
    <VcEmptyView v-if="!contacts.length && !loading" :text="$t('pages.company.members.no_results_found_message')">
      <template #icon v-if="isMobile">
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.orders.orders_icon')" />
      </template>

      <template #button>
        <VcButton class="px-6 uppercase" size="lg" @click="resetKeyword">
          <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.company.members.buttons.reset_search") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcTable
        :loading="loading"
        :items="contacts"
        :columns="columns"
        :sort="sort"
        :pages="pages"
        :page="page"
        layout="table-auto"
        @headerClick="applySorting"
        @pageChanged="changePage"
      >
        <template #desktop-body>
          <tr v-for="contact in contacts" :key="contact.id" class="even:bg-gray-50">
            <td class="pl-4 pr-0 py-2.5 w-px">
              <!-- STUB -->
              <div class="rounded-full bg-gray-500 h-9 w-9">&nbsp;</div>
            </td>
            <td class="pl-5 pr-1 py-2.5">
              {{ contact.fullName }}
            </td>
            <td class="pl-5 pr-1 py-2.5">
              {{ contact.role }}
            </td>
            <td class="pl-5 pr-1 py-2.5">
              {{ contact.email }}
            </td>
            <td class="px-5 py-2.5 w-24 overflow-hidden">
              <div class="flex justify-start">
                <VcTooltip>
                  <template #trigger>
                    <img width="20" height="20" :src="contact.displayStatus.iconUrl" />
                  </template>
                  <template #content>
                    <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">
                      {{ $t(contact.displayStatus.localeLabel) }}
                    </div>
                  </template>
                </VcTooltip>
              </div>
            </td>
            <!--
            <td class="p-5 w-px">
              <VcButton class="px-2 rounded" size="sm" is-outline>
                <i class="fas fa-cog text-lg" />
              </VcButton>
            </td>
            -->
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="row of itemsPerPage" :key="row" class="even:bg-gray-50">
            <td v-for="column of columns" :key="column.id" class="p-5">
              <div class="h-6 bg-gray-200 animate-pulse"></div>
            </td>
          </tr>
        </template>

        <template #mobile-item="contacts">
          <div class="flex items-center border-b">
            <div class="py-4.5 pl-6">
              <!-- STUB -->
              <div class="rounded-full bg-gray-500 h-9 w-9">&nbsp;</div>
            </div>

            <div class="flex-grow py-4.5 pl-4">
              <div>
                <b>{{ contacts.item.fullName }}</b>
              </div>
              <div v-if="contacts.item.role">
                {{ contacts.item.role }}
              </div>
            </div>

            <div class="py-4.5 pr-6">
              <div class="px-2.5 py-0.5 w-20 text-center rounded-sm" :class="contacts.item.displayStatus.cssStyles">
                {{ $t(contacts.item.displayStatus.localeLabel) }}
              </div>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="row of itemsPerPage" :key="row" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
            <div class="flex flex-col">
              <div class="py-6 pl-6 bg-gray-200 animate-pulse"></div>
            </div>

            <div class="flex flex-col">
              <div class="py-6 pl-4 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { ref, onMounted } from "vue";
import { useOrganizationContacts } from "@/shared/account";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading, page, pages, itemsPerPage, sort, keyword, loadContacts, contacts } = useOrganizationContacts();

usePageHead({
  title: t("pages.company.members.meta.title"),
});

const isMobile = breakpoints.smaller("lg");

const columns = ref<ITableColumn[]>([
  {
    id: "roleIcon",
  },
  {
    id: "name",
    title: t("pages.company.members.content_header.name"),
    sortable: true,
  },
  {
    id: "role",
    title: t("pages.company.members.content_header.role"),
    sortable: true,
  },
  {
    id: "email",
    title: t("pages.company.members.content_header.email"),
    sortable: true,
  },
  {
    id: "status",
    title: t("pages.company.members.content_header.active"),
    sortable: false,
  },
  /*{
    id: "actions",
  },*/
]);

const searchContacts = async () => {
  if (!keyword.value) {
    return;
  }
  page.value = 1;
  await loadContacts();
};

const resetKeyword = async () => {
  keyword.value = "";
  page.value = 1;
  await loadContacts();
};

const applySorting = async (column: string) => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === SORT_DESCENDING ? SORT_ASCENDING : SORT_DESCENDING;
  } else {
    sort.value.column = column;
    sort.value.direction = SORT_DESCENDING;
  }

  page.value = 1;
  await loadContacts();
};

const changePage = async (newPage: number) => {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await loadContacts();
};

onMounted(async () => {
  await loadContacts();
});
</script>
