<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.members.title'" />
      <div v-if="!isMobile" class="space-x-4">
        <VcButton class="uppercase p-4" is-outline @click="openInviteMemberDialog">
          {{ $t("pages.company.members.buttons.invite_members") }}
        </VcButton>
        <VcButton class="uppercase p-4" is-outline @click="openAddNewMemberPopup">
          {{ $t("pages.company.members.buttons.add_new_member") }}
        </VcButton>
      </div>
      <div v-else class="flex flex-no-wrap space-x-2">
        <VcButton class="uppercase p-4" is-outline @click="openAddNewMemberPopup">
          {{ $t("pages.company.members.buttons.new") }}
        </VcButton>
        <VcButton class="uppercase p-4" is-outline @click="openInviteMemberDialog">
          {{ $t("pages.company.members.buttons.invite") }}
        </VcButton>
      </div>
    </div>

    <!-- Search & filters block -->
    <div class="flex gap-x-2 lg:gap-x-5 lg:flex-row-reverse mx-5 md:mx-0">
      <!--
      <VcButton ref="filterButtonElement" :is-disabled="true" is-outline size="lg" class="p-4 w-11 lg:w-auto uppercase">
        <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
        <span class="lg:hidden fa fa-filter"></span>
      </VcButton>
      -->

      <div class="flex flex-grow">
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
        :item-action-builder="actionBuilder"
        layout="table-auto"
        @headerClick="applySorting"
        @pageChanged="changePage"
      >
        <template #desktop-body>
          <tr v-for="contact in contacts" :key="contact.id" class="even:bg-gray-50">
            <td class="pl-4 pr-0 py-2.5">
              <!-- STUB -->
              <div class="rounded-full bg-gray-500 h-9 w-9">&nbsp;</div>
            </td>

            <td class="px-4 py-2.5">
              {{ contact.fullName }}
            </td>

            <td class="px-4 py-2.5">
              {{ contact.role }}
            </td>

            <td class="px-4 py-2.5">
              {{ contact.email }}
            </td>

            <td class="px-4 py-3 text-center">
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
            </td>

            <!--<td class="px-5 text-right">
              <VcActionDropdownMenu>
                <button class="flex items-center p-3 whitespace-nowrap">
                  <i class="fas fa-pencil-alt mr-2 leading-none text-base text-[color:var(--color-warning)]" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.edit_role") }}</span>
                </button>

                <button class="flex items-center p-3 whitespace-nowrap">
                  <i class="fas fa-ban mr-2 leading-none text-base text-black" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.edit_role") }}</span>
                </button>

                <button class="flex items-center p-3 whitespace-nowrap" @click="openDeleteMemberDialog(contact)">
                  <i class="fas fa-times mr-2 leading-none text-xl text-[color:var(--color-danger)]" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.edit_role") }}</span>
                </button>
              </VcActionDropdownMenu>
            </td>-->
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="row in itemsPerPage" :key="row" class="even:bg-gray-50">
            <td class="pl-4 pr-0 py-2.5">
              <div class="rounded-full bg-gray-200 animate-pulse h-9 w-9"></div>
            </td>

            <td v-for="column in columns.length - 1" :key="column" class="px-4 py-3">
              <div class="h-5 bg-gray-200 animate-pulse"></div>
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
import { usePopup } from "@/shared/popup";
import { getNewSorting } from "@/core/utilities";
import {
  AddNewCompanyMemberDialog,
  InviteMemberDialog,
  useOrganizationContacts,
  DeleteCompanyMemberDialog,
} from "@/shared/company";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { OrganizationContactType } from "@/core/types";

const { t } = useI18n();
const { openPopup, closePopup } = usePopup();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loading, page, pages, itemsPerPage, sort, keyword, loadContacts, contacts, updateMember } =
  useOrganizationContacts();

usePageHead({
  title: t("pages.company.members.meta.title"),
});

const isMobile = breakpoints.smaller("lg");

const columns = ref<ITableColumn[]>([
  {
    id: "roleIcon",
    classes: "w-14",
  },
  {
    id: "name",
    title: t("pages.company.members.content_header.name"),
    sortable: true,
  },
  {
    id: "role",
    title: t("pages.company.members.content_header.role"),
  },
  {
    id: "email",
    title: t("pages.company.members.content_header.email"),
  },
  {
    id: "status",
    title: t("pages.company.members.content_header.active"),
    align: "center",
    classes: "w-24",
  },
  /*{
    id: "actions",
    classes: "w-16",
  },*/
]);

function openInviteMemberDialog() {
  openPopup({
    component: InviteMemberDialog,
    props: {
      onResult(succeed: boolean) {
        if (succeed) {
          loadContacts();
        }
      },
    },
  });
}

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
  sort.value = getNewSorting(sort.value, column);
  page.value = 1;
  await loadContacts();
};

const changePage = async (newPage: number) => {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await loadContacts();
};

const deleteContactFromOrganization = async (contact: OrganizationContactType) => {
  await updateMember({
    ...contact,
    organizationsIds: [],
  });
  await loadContacts();
};

onMounted(async () => {
  await loadContacts();
});

function openAddNewMemberPopup() {
  openPopup({
    component: AddNewCompanyMemberDialog,
    props: {
      onResult: async (success: boolean) => {
        if (success) {
          await loadContacts();
        }
      },
    },
  });
}

function openDeleteMemberDialog(contact: OrganizationContactType): void {
  openPopup({
    component: DeleteCompanyMemberDialog,
    props: {
      contact,
      onConfirm() {
        closePopup();
        deleteContactFromOrganization(contact);
      },
    },
  });
}

function actionBuilder(contact: OrganizationContactType) {
  const result: ItemAction[] = [
    {
      icon: "fas fa-trash-alt",
      title: t("pages.company.members.buttons.delete"),
      leftActions: true,
      bgColor: "bg-[color:var(--color-danger)]",
      clickHandler() {
        openDeleteMemberDialog(contact);
      },
    },
  ];

  return result;
}
</script>
