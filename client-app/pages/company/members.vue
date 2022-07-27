<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.members.title'" />
      <div class="space-x-4" v-if="!isMobile">
        <VcButton :is-disabled="true" class="uppercase" is-outline>
          {{ $t("pages.company.members.buttons.invite_members") }}
        </VcButton>
        <VcButton :is-disabled="true" class="uppercase" is-outline>
          {{ $t("pages.company.members.buttons.add_new_member") }}
        </VcButton>
      </div>
    </div>

    <!-- Search & filters block -->
    <div class="flex gap-3 lg:flex-row-reverse">
      <div class="relative ml-5 md:mx-0">
        <VcButton ref="filterButtonElement" :is-disabled="true" is-outline size="lg" class="p-4 uppercase">
          <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
          <span class="lg:hidden fa fa-filter"></span>
        </VcButton>
      </div>

      <div class="flex flex-grow mr-5 md:mx-0">
        <div class="relative grow">
          <input
            v-model.trim="keyword"
            :disabled="loading"
            class="w-full appearance-none bg-white rounded rounded-r-none h-11 px-4 font-medium outline-none text-sm border border-gray-300 focus:border-gray-400 disabled:bg-gray-200"
            @keypress.enter="searchContacts"
          />

          <button v-if="keyword" class="absolute right-[14px] top-[14px]" @click="resetKeyword">
            <svg class="text-[color:var(--color-primary)]" height="14" width="14">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton :is-disabled="loading" class="px-4 !rounded-l-none uppercase" size="lg" @click="searchContacts">
          <i class="fas fa-search text-lg" />
        </VcButton>
      </div>
    </div>

    <!-- Content block -->
    <div class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcTable
        :loading="loading"
        :items="contacts"
        :columns="columns"
        :sort="sort"
        :pages="pages"
        :page="page"
        @headerClick="applySorting"
        @pageChanged="changePage"
      >
        <template #desktop-body>
          <tr v-for="contact in contacts" :key="contact.id" class="even:bg-gray-50 hover:bg-gray-200 cursor-pointer">
            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ contact.fullName }}
            </td>
            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ contact.role }}
            </td>
            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ contact.email }}
            </td>
            <td class="p-5 overflow-hidden overflow-ellipsis">
              {{ contact.status }}
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="row of itemsPerPage" :key="row" class="even:bg-gray-50">
            <td v-for="column of columns" :key="column.id" class="p-5">
              <div class="h-6 bg-gray-200 animate-pulse"></div>
            </td>
          </tr>
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
    sortable: true,
  },
]);

const searchContacts = async () => {
  page.value = 1;
  await loadContacts();
};

const resetKeyword = async () => {
  keyword.value = "";
  await searchContacts();
};

const applySorting = async (column: string) => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === SORT_DESCENDING ? SORT_ASCENDING : SORT_DESCENDING;
  } else {
    sort.value.column = column;
    sort.value.direction = SORT_DESCENDING;
  }

  await searchContacts();
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
