<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.info.title'" />
    </div>

    <div class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <!-- Company name block -->
      <div class="flex flex-row p-5 gap-3 shadow-lg">
        <VcInput
          v-model.trim="organizationName"
          :label="$t('pages.company.info.labels.company_name')"
          :is-disabled="!isOrganizationMaintainer || loadingOrganization || loadingUser"
          :error-message="errors[0]"
          name="organization-name"
          autocomplete="off"
          maxlength="64"
          class="w-full"
        />

        <div class="pt-6" v-if="isOrganizationMaintainer">
          <VcButton
            :is-waiting="loadingOrganization || loadingUser"
            :is-disabled="!meta.valid || !meta.dirty"
            size="lg"
            class="uppercase my-0.5 !h-10"
            @click="meta.valid && meta.dirty ? saveOrganizationName() : null"
          >
            <i class="md:hidden px-2 fas fa-save text-2xl" />
            <span class="hidden md:inline mx-12">{{ $t("common.buttons.save") }}</span>
          </VcButton>
        </div>
      </div>

      <!-- Content block -->
      <div class="md:p-5">
        <div
          v-if="addresses.length || loadingAddresses"
          class="flex flex-row justify-between items-center gap-3 mx-6 md:mx-0 mt-9 md:mt-1.5 mb-5 md:mb-4"
        >
          <h2 class="text-gray-800 text-xl font-extrabold uppercase py-0.5" v-t="'pages.company.info.content_header'" />

          <!--
          <VcButton
            v-if="isOrganizationMaintainer"
            class="px-3 uppercase"
            size="sm"
            is-outline
            @click="addOrUpdateAddressDialog()"
          >
            <span class="sm:hidden">{{ $t("pages.company.info.buttons.add_new_address_mobile") }}</span>
            <span class="hidden sm:inline">{{ $t("pages.company.info.buttons.add_new_address") }}</span>
          </VcButton>
          -->
        </div>

        <VcEmptyView
          v-if="!addresses.length && !loadingAddresses"
          :text="$t('pages.company.info.no_addresses_message')"
          class="py-16"
        >
          <template #icon>
            <VcImage
              src="/static/images/account/icons/no-addresses.svg"
              :alt="$t('pages.company.info.no_addresses_message')"
              lazy
            />
          </template>

          <template #button v-if="isOrganizationMaintainer">
            <VcButton class="px-4 uppercase" size="lg" @click="addOrUpdateAddressDialog()">
              <i class="fa fa-plus -ml-px mr-3" />
              {{ $t("pages.company.info.buttons.add_new_address") }}
            </VcButton>
          </template>
        </VcEmptyView>

        <div v-else class="flex flex-col md:rounded md:border">
          <VcTable
            :loading="loadingAddresses"
            :columns="columns"
            :items="addresses"
            :sort="sort"
            :pages="pages"
            :page="page"
            @headerClick="applySorting"
            @pageChanged="onPageChange"
          >
            <template #mobile-item="{ item }">
              <div class="grid grid-cols-3 relative px-6 py-5 gap-4 text-sm border-t border-gray-200">
                <div
                  v-if="item.isDefault"
                  class="absolute top-0 right-0 border-[23px] border-transparent border-t-[color:var(--color-primary)] border-r-[color:var(--color-primary)]"
                >
                  <i class="absolute -top-[22px] -right-[21px] fas fa-check mr-1 text-base text-white" />
                </div>

                <div class="flex flex-col col-span-2">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.address'" />

                  <b class="leading-tight overflow-hidden overflow-ellipsis">
                    <span>{{ item.line1 }}</span>
                    <template v-if="item.city">, {{ item.city }}</template>
                    <template v-if="item.regionName">, {{ item.regionName }}</template>
                  </b>
                </div>

                <div class="flex flex-col">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.country'" />

                  <span class="leading-tight overflow-hidden overflow-ellipsis">
                    {{ item.countryName }}
                  </span>
                </div>

                <div class="flex flex-col col-span-2">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.description'" />

                  <span class="leading-tight overflow-hidden overflow-ellipsis">
                    {{ item.description }}
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.zip'" />

                  <span class="leading-tight overflow-hidden overflow-ellipsis">
                    {{ item.postalCode }}
                  </span>
                </div>
              </div>
            </template>

            <template #mobile-skeleton>
              <div
                v-for="i in itemsPerPage"
                :key="i"
                class="grid grid-cols-3 relative px-6 py-5 gap-4 text-sm border-t border-gray-200"
              >
                <div class="flex flex-col col-span-2">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.address'" />
                  <div class="h-4 bg-gray-200 animate-pulse"></div>
                </div>

                <div class="flex flex-col">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.country'" />
                  <div class="h-4 bg-gray-200 animate-pulse"></div>
                </div>

                <div class="flex flex-col col-span-2">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.description'" />
                  <div class="h-4 bg-gray-200 animate-pulse"></div>
                </div>

                <div class="flex flex-col">
                  <span class="text-gray-400" v-t="'pages.company.info.labels.zip'" />
                  <div class="h-4 bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </template>

            <template #desktop-body>
              <tr v-for="address in addresses" :key="address.id" class="even:bg-gray-50">
                <td class="px-5 py-3 overflow-hidden overflow-ellipsis">
                  <span>{{ address.line1 }}</span>
                  <template v-if="address.city">, {{ address.city }}</template>
                  <template v-if="address.regionName">, {{ address.regionName }}</template>
                </td>

                <td class="px-5 py-3 overflow-hidden overflow-ellipsis">
                  {{ address.description }}
                </td>

                <td class="px-5 py-3 overflow-hidden overflow-ellipsis">
                  {{ address.postalCode }}
                </td>

                <td class="px-5 py-3 overflow-hidden overflow-ellipsis">
                  {{ address.countryName }}
                </td>

                <td
                  :class="{ 'text-right': !isOrganizationMaintainer }"
                  class="px-5 py-3 overflow-hidden overflow-ellipsis"
                >
                  <div v-if="address.isDefault" class="inline-flex flex-row items-center">
                    <i class="fas fa-check mr-1 text-17 text-[color:var(--color-primary)]" />
                    <b v-t="'pages.company.info.labels.default'" />
                  </div>
                </td>

                <td v-if="isOrganizationMaintainer" class="px-5 py-3 text-right">
                  <!-- TODO: actions -->
                </td>
              </tr>
            </template>

            <template #desktop-skeleton>
              <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
                <td v-for="column in columns" class="px-5 py-3" :key="column.id">
                  <div class="h-5 bg-gray-200 animate-pulse" />
                </td>
              </tr>
            </template>
          </VcTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { computedEager } from "@vueuse/core";
import { useField } from "vee-validate";
import * as yup from "yup";
import { usePageHead } from "@/core/composables";
import { useUser } from "@/shared/account";
import { useOrganization, useOrganizationAddresses } from "@/shared/company";
import { SORT_ASCENDING, SORT_DESCENDING } from "@/core/constants";
import { ORGANIZATION_MAINTAINER } from "@/core/security-constants";

const { t } = useI18n();

usePageHead({
  title: t("pages.company.info.meta.title"),
});

const { loading: loadingUser, organization, checkPermissions } = useUser();
const { loading: loadingOrganization, updateOrganization } = useOrganization();
const {
  addresses,
  pages,
  page,
  sort,
  itemsPerPage,
  fetchAddresses,
  loading: loadingAddresses,
} = useOrganizationAddresses();
const {
  meta,
  errors,
  value: organizationName,
  resetField: resetOrganizationField,
} = useField<string>("organizationName", yup.string().max(64).required());

/**
 * This page is accessible only to members of the organization,
 * so the organization ID must exist.
 */
const organizationId = computed<string>(() => organization.value!.id);
const isOrganizationMaintainer = computedEager<boolean>(() => checkPermissions(...ORGANIZATION_MAINTAINER.permissions));

const columns = computed<ITableColumn[]>(() => {
  const result: ITableColumn[] = [
    {
      id: "line1",
      title: t("pages.company.info.labels.address"),
      sortable: true,
    },
    {
      id: "description",
      title: t("pages.company.info.labels.description"),
      sortable: true,
    },
    {
      id: "postalCode",
      title: t("pages.company.info.labels.zip"),
      classes: "w-28",
    },
    {
      id: "countryName",
      title: t("pages.company.info.labels.country"),
    },
    {
      id: "isDefault",
      classes: "w-1/6",
    },
  ];

  if (isOrganizationMaintainer.value) {
    // Add action column
    result.push({
      id: "id",
      classes: "w-20",
    });
  }

  return result;
});

async function saveOrganizationName() {
  await updateOrganization({
    id: organizationId.value,
    name: organizationName.value,
  });
}

async function onPageChange(newPage: number) {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
  await fetchAddresses(organizationId.value);
}

async function applySorting(column: string) {
  // TODO: move this logic to utility function
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === SORT_DESCENDING ? SORT_ASCENDING : SORT_DESCENDING;
  } else {
    sort.value.column = column;
    sort.value.direction = SORT_DESCENDING;
  }

  page.value = 1;
  await fetchAddresses(organizationId.value);
}

function addOrUpdateAddressDialog() {
  // TODO: implement in another user story
  // see a similar function in `client-app/pages/checkout.vue`
}

fetchAddresses(organizationId.value);

watch(
  () => organization.value!.name!,
  (name) => resetOrganizationField({ value: name }),
  { immediate: true }
);
</script>
