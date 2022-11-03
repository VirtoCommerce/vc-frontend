<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.members.title'" />

      <div class="flex flex-no-wrap space-x-2 md:space-x-4">
        <VcButton
          v-if="$can($permissions.storefront.CanInviteUsers)"
          class="uppercase p-4"
          is-outline
          @click="openInviteDialog"
        >
          <span class="md:hidden">{{ $t("pages.company.members.buttons.invite") }}</span>
          <span class="hidden md:inline">{{ $t("pages.company.members.buttons.invite_members") }}</span>
        </VcButton>
      </div>
    </div>

    <!-- Mobile filters sidebar -->
    <VcPopupSidebar class="px-5 pt-6 w-72" :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <div class="relative">
        <button class="absolute -right-3 appearance-none px-3 py-1" @click="hideFilters">
          <span class="text-2xl fas fa-times text-red-400 hover:text-red-700"></span>
        </button>
      </div>

      <div class="font-semibold text-2xl pt-1 mb-6">
        {{ $t("common.buttons.filters") }}
      </div>

      <div class="flex flex-col grow gap-6">
        <FilterFacet v-for="(_, index) in selectableFacets" v-model="selectableFacets[index]" :key="index" />
      </div>

      <div class="sticky z-100 bottom-0 mt-4 -mx-5 px-5 py-5 shadow-t-md bg-white">
        <div class="flex gap-x-4">
          <VcButton
            :is-disabled="!numberOfFacetsApplied && !isFacetsDirty"
            class="flex-1 uppercase"
            size="lg"
            is-outline
            @click="
              resetFilters();
              hideFilters();
            "
          >
            {{ $t("common.buttons.reset") }}
          </VcButton>

          <VcButton
            :is-disabled="!isFacetsDirty"
            class="flex-1 uppercase"
            size="lg"
            @click="
              applyFilters();
              hideFilters();
            "
          >
            {{ $t("common.buttons.apply") }}
          </VcButton>
        </div>
      </div>
    </VcPopupSidebar>

    <div class="-mt-5" ref="stickyMobileHeaderAnchor"></div>

    <!-- Page Toolbar -->
    <PageToolbarBlock
      :stick="isVisibleStickyMobileHeader"
      class="flex flex-row lg:flex-row-reverse items-center py-3.5 -my-3.5 gap-x-2 lg:gap-x-5"
      shadow
    >
      <div class="relative">
        <VcButton
          ref="filtersButtonElement"
          :is-disabled="contactsLoading"
          :is-outline="!filtersVisible && !isMobile"
          size="lg"
          class="w-11 lg:w-auto px-3.5 uppercase"
          @click="filtersVisible = !filtersVisible"
        >
          <span class="hidden lg:inline-block">{{ $t("common.buttons.filters") }}</span>
          <span class="lg:hidden fa fa-filter"></span>

          <transition :name="isMobile ? 'fade' : 'slide-fade-right'">
            <span
              v-if="numberOfFacetsApplied"
              :class="[
                filtersVisible || isMobile
                  ? 'text-[color:var(--color-primary)] bg-white'
                  : 'text-white bg-[color:var(--color-primary)]',
              ]"
              class="absolute lg:relative -left-2.5 lg:left-auto -top-2.5 lg:top-auto lg:ml-2 border border-[color:var(--color-primary)] lg:border-0 h-5 w-5 rounded-full box-content font-lato text-13"
            >
              {{ numberOfFacetsApplied }}
            </span>
          </transition>
        </VcButton>

        <!-- Desktop filters dropdown -->
        <div
          v-if="filtersVisible && !isMobile"
          ref="filtersDropdownElement"
          class="absolute right-0 z-[1] bg-white shadow-lg rounded border mt-2 p-6"
        >
          <button class="absolute top-0 right-0 appearance-none px-4 py-2" @click="hideFilters">
            <span class="text-lg fa fa-times text-red-400 hover:text-red-500"></span>
          </button>

          <div class="flex flex-row gap-6 pr-4">
            <FilterFacet v-for="(_, index) in selectableFacets" v-model="selectableFacets[index]" :key="index" />
          </div>

          <div class="flex flex-row justify-end gap-4 mt-6">
            <VcButton
              :is-disabled="!numberOfFacetsApplied && !isFacetsDirty"
              kind="secondary"
              size="sm"
              class="uppercase px-8 w-full lg:w-auto"
              is-outline
              @click="
                resetFilters();
                hideFilters();
              "
            >
              {{ $t("common.buttons.reset") }}
            </VcButton>

            <VcButton
              :is-disabled="!isFacetsDirty"
              size="sm"
              class="uppercase px-8 w-full lg:w-auto"
              @click="
                applyFilters();
                hideFilters();
              "
            >
              {{ $t("common.buttons.apply") }}
            </VcButton>
          </div>
        </div>
      </div>

      <div class="flex grow">
        <div class="relative grow">
          <VcInput
            v-model="localKeyword"
            maxlength="64"
            class="w-full"
            input-class="font-medium rounded-r-none !text-sm disabled:bg-gray-200 !pl-4 !pr-11"
            :is-disabled="contactsLoading"
            @keypress.enter="applyKeyword"
            :placeholder="$t('pages.company.members.search_placeholder')"
          />

          <button v-if="localKeyword" class="absolute right-0 top-0 h-11 px-4" @click="resetKeyword">
            <svg class="text-[color:var(--color-primary)]" height="14" width="14">
              <use href="/static/images/delete.svg#main" />
            </svg>
          </button>
        </div>

        <VcButton :is-disabled="contactsLoading" class="w-11 uppercase !rounded-l-none" size="lg" @click="applyKeyword">
          <i class="fas fa-search text-lg" />
        </VcButton>
      </div>
    </PageToolbarBlock>

    <!-- Filters chips -->
    <div v-if="numberOfFacetsApplied" class="hidden lg:flex flex-wrap gap-x-3 gap-y-2">
      <VcChip
        class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
        size="sm"
        is-outline
        clickable
        closable
        @click="resetFilters"
        @close="resetFilters"
      >
        {{ $t("common.buttons.reset_filters") }}
      </VcChip>

      <template v-for="facet in appliedFacets">
        <template v-for="facetValue in facet.values">
          <VcChip
            v-if="facetValue.selected"
            :key="facet.paramName + facetValue.value"
            class="[--color-primary:#292D3B] [--color-primary-hover:#12141A]"
            size="sm"
            closable
            @close="resetFilterItem(facet, facetValue)"
          >
            {{ facetValue.label }}
          </VcChip>
        </template>
      </template>
    </div>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!contacts.length && !contactsLoading"
      :text="
        keyword || filter
          ? $t('pages.company.members.no_results_message')
          : $t('pages.company.members.no_members_message')
      "
    >
      <template #icon>
        <VcImage src="/static/images/common/order.svg" :alt="$t('pages.company.members.no_members_img_alt')" />
      </template>

      <template #button>
        <VcButton v-if="keyword || filter" class="px-6 uppercase" size="lg" @click="resetFiltersWithKeyword">
          <i class="fas fa-undo text-inherit -ml-0.5 mr-2.5" />
          {{ $t("pages.company.members.buttons.reset_search") }}
        </VcButton>

        <VcButton v-else :to="{ name: 'Catalog' }" class="px-6 uppercase" size="lg">
          {{ $t("pages.company.members.buttons.no_members") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcTable
        :loading="contactsLoading"
        :items="contacts"
        :columns="columns"
        :sort="sort"
        :pages="pages"
        :page="page"
        :item-actions-builder="itemActionsBuilder"
        layout="table-auto"
        @headerClick="applySorting"
        @pageChanged="changePage"
      >
        <template #desktop-body>
          <tr v-for="contact in contacts" :key="contact.id" class="even:bg-gray-50">
            <td class="pl-4 pr-0 py-2.5">
              <RoleIcon :role-id="contact.extended.roles[0]?.id" />
            </td>

            <td class="px-4 py-2.5">
              {{ contact.fullName }}
            </td>

            <td class="px-4 py-2.5">
              {{ contact.extended.roles[0]?.name }}
            </td>

            <td class="px-4 py-2.5">
              {{ contact.extended.emails[0] }}
            </td>

            <td class="px-4 py-3 text-center">
              <VcTooltip>
                <template #trigger>
                  <img width="20" height="20" :src="contact.extended.displayStatus.iconUrl" />
                </template>

                <template #content>
                  <div class="bg-white rounded-sm text-xs text-tooltip shadow-sm-x-y py-1.5 px-3.5">
                    {{ $t(contact.extended.displayStatus.localeLabel) }}
                  </div>
                </template>
              </VcTooltip>
            </td>

            <td v-if="userCanEditOrganization" class="px-5 text-right">
              <VcActionDropdownMenu v-if="contact.id !== user.memberId">
                <!--<button class="flex items-center p-3 whitespace-nowrap">
                  <i class="fas fa-pencil-alt mr-2 leading-none text-base text-[color:var(--color-warning)]" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.edit_role") }}</span>
                </button>-->

                <button
                  v-if="contact.status === ContactStatus.Locked"
                  class="flex items-center p-3 whitespace-nowrap"
                  @click="openLockOrUnlockDialog(contact, true)"
                >
                  <i class="fas fa-check mr-2 leading-none text-base text-[color:var(--color-success)]" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.unblock_user") }}</span>
                </button>

                <button v-else class="flex items-center p-3 whitespace-nowrap" @click="openLockOrUnlockDialog(contact)">
                  <i class="fas fa-ban mr-2 leading-none text-base text-black" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.block_user") }}</span>
                </button>

                <button class="flex items-center p-3 whitespace-nowrap" @click="openDeleteDialog(contact)">
                  <i class="fas fa-times mr-2 leading-none text-xl text-[color:var(--color-danger)]" />
                  <span class="text-15 font-medium">{{ $t("pages.company.members.buttons.delete") }}</span>
                </button>
              </VcActionDropdownMenu>
            </td>
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

        <template #mobile-item="{ item }">
          <div class="flex items-center border-b">
            <div class="py-4.5 pl-6">
              <RoleIcon :role-id="item.extended.roles[0]?.id" />
            </div>

            <div class="flex-grow py-4.5 pl-4">
              <div>
                <b>{{ item.fullName }}</b>
              </div>

              <div class="text-sm">
                {{ item.extended.roles[0]?.name }}
              </div>
            </div>

            <div class="py-4.5 pr-6">
              <div class="px-2.5 py-0.5 w-20 text-center rounded-sm" :class="item.extended.displayStatus.cssStyles">
                {{ $t(item.extended.displayStatus.localeLabel) }}
              </div>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="row in itemsPerPage" :key="row" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
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
import { ref, onMounted, shallowRef, computed } from "vue";
import { useI18n } from "vue-i18n";
import { breakpointsTailwind, computedEager, onClickOutside, useBreakpoints } from "@vueuse/core";
import { useElementVisibility, usePageHead } from "@/core/composables";
import { FacetItem, FacetValueItem } from "@/core/types";
import { getFilterExpressionFromFacets, getNewSorting } from "@/core/utilities";
import { usePopup } from "@/shared/popup";
import {
  InviteMemberDialog,
  useOrganizationContacts,
  RoleIcon,
  ExtendedContactType,
  useOrganizationContactsFilterFacets,
  FilterFacet,
  ContactStatus,
} from "@/shared/company";
import { PageToolbarBlock, useUser } from "@/shared/account";
import { XApiPermissions } from "@/core/constants";

const { t } = useI18n();

usePageHead({
  title: t("pages.company.members.meta.title"),
});

/**
 * This page is accessible only to members of the organization,
 * so the organization must exist.
 */
const { user, checkPermissions, organization } = useUser();
const {
  loading: contactsLoading,
  page,
  pages,
  itemsPerPage,
  sort,
  keyword,
  filter,
  contacts,
  fetchContacts,
  lockContact,
  unlockContact,
  removeMemberFromOrganization,
} = useOrganizationContacts(organization.value!.id);
const {
  selectableFacets,
  appliedFacets,
  isFacetsDirty,
  numberOfFacetsApplied,
  resetSelectableToAppliedFacets,
  applyFacets,
  resetFacets,
  resetFacetItem,
} = useOrganizationContactsFilterFacets();
const { openPopup } = usePopup();
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");
const localKeyword = ref("");
const filtersVisible = ref(false);
const filtersButtonElement = shallowRef<HTMLElement | null>(null);
const filtersDropdownElement = shallowRef<HTMLElement | null>(null);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor, { direction: "top" });

const userCanEditOrganization = computedEager<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));

const columns = computed<ITableColumn[]>(() => {
  const result: ITableColumn[] = [
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
  ];

  if (userCanEditOrganization.value) {
    // Add action column
    result.push({
      id: "actions",
      classes: "w-20",
    });
  }

  return result;
});

const isVisibleStickyMobileHeader = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchContacts();
}

async function applySorting(column: string) {
  sort.value = getNewSorting(sort.value, column);
  page.value = 1;
  await fetchContacts();
}

async function applyKeyword() {
  keyword.value = localKeyword.value;
  page.value = 1;
  await fetchContacts();
}

async function resetKeyword() {
  localKeyword.value = "";

  if (keyword.value) {
    await applyKeyword();
  }
}

async function applyFilters() {
  applyFacets();
  filter.value = getFilterExpressionFromFacets(appliedFacets);
  page.value = 1;
  await fetchContacts();
}

async function resetFilterItem(facet: FacetItem, facetValue: FacetValueItem) {
  resetFacetItem({ paramName: facet.paramName, value: facetValue.value });
  filter.value = getFilterExpressionFromFacets(appliedFacets);
  page.value = 1;
  await fetchContacts();
}

async function resetFilters() {
  resetFacets();
  filter.value = "";
  page.value = 1;
  await fetchContacts();
}

function resetFiltersWithKeyword() {
  localKeyword.value = "";
  keyword.value = "";
  resetFilters();
}

function hideFilters() {
  filtersVisible.value = false;
  resetSelectableToAppliedFacets();
}

function openInviteDialog() {
  openPopup({
    component: InviteMemberDialog,
    props: {
      onResult(succeed: boolean) {
        if (succeed) {
          fetchContacts();
        }
      },
    },
  });
}

function openLockOrUnlockDialog(contact: ExtendedContactType, isUnlock?: boolean): void {
  const closeLockOrUnlockDialog = openPopup({
    component: "VcConfirmationDialog",
    props: {
      variant: "info",
      iconVariant: "warning",
      loading: contactsLoading,
      title: isUnlock ? t("shared.company.unblock_member_dialog.title") : t("shared.company.block_member_dialog.title"),
      text: isUnlock ? t("shared.company.unblock_member_dialog.text") : t("shared.company.block_member_dialog.text"),
      async onConfirm() {
        if (isUnlock) {
          await unlockContact(contact);
        } else {
          await lockContact(contact);
        }
        closeLockOrUnlockDialog();
      },
    },
  });
}

function openDeleteDialog(contact: ExtendedContactType): void {
  const closeDeleteDialog = openPopup({
    component: "VcConfirmationDialog",
    props: {
      variant: "danger",
      iconVariant: "danger",
      loading: contactsLoading,
      title: t("shared.company.delete_member_dialog.title"),
      text: t("shared.company.delete_member_dialog.text", {
        name: `${contact.fullName} (${contact.extended.emails[0]})`,
      }),
      async onConfirm() {
        await removeMemberFromOrganization({
          contactId: contact.id,
          organizationId: organization.value!.id,
        });
        closeDeleteDialog();
      },
    },
  });
}

function itemActionsBuilder(item: ExtendedContactType) {
  const actions: SlidingActionsItem[] = [];

  if (checkPermissions(XApiPermissions.CanEditOrganization) && item.id !== user.value.memberId) {
    actions.push(
      item.status === ContactStatus.Locked
        ? {
            icon: "fas fa-check",
            title: t("pages.company.members.buttons.unblock_user"),
            classes: "bg-[color:var(--color-success)]",
            clickHandler(contact: ExtendedContactType) {
              openLockOrUnlockDialog(contact, true);
            },
          }
        : {
            icon: "fas fa-ban",
            title: t("pages.company.members.buttons.block_user"),
            classes: "bg-[color:#292D3B]",
            clickHandler(contact: ExtendedContactType) {
              openLockOrUnlockDialog(contact);
            },
          },
      /*
      {
        icon: "fas fa-pencil-alt",
        title: t("pages.company.members.buttons.edit_role"),
        classes: "bg-gray-550",
        clickHandler(contact: ExtendedContactType) {
          console.log(contact);
        },
      },
      */
      {
        icon: "fas fa-trash-alt",
        title: t("pages.company.members.buttons.delete"),
        left: true,
        classes: "bg-[color:var(--color-danger)]",
        clickHandler(contact: ExtendedContactType) {
          openDeleteDialog(contact);
        },
      }
    );
  }

  return actions;
}

onClickOutside(
  filtersDropdownElement,
  () => {
    hideFilters();
  },
  { ignore: [filtersButtonElement] }
);

onMounted(() => {
  fetchContacts();
});
</script>
