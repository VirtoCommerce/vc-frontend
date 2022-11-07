<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.info.title'" />
    </div>

    <div class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <!-- Company name block -->
      <div class="flex flex-row p-5 gap-3 shadow [--tw-shadow:0_10px_15px_0_rgb(0_0_0_/_0.06)]">
        <VcInput
          v-model.trim="organizationName"
          :label="$t('pages.company.info.labels.company_name')"
          :is-disabled="!userCanEditOrganization || loadingOrganization || loadingUser"
          :error-message="errors[0]"
          name="organization-name"
          autocomplete="off"
          maxlength="64"
          class="w-full"
        />

        <div class="pt-6" v-if="userCanEditOrganization">
          <VcButton
            :is-waiting="loadingOrganization || loadingUser"
            :is-disabled="!meta.valid || !meta.dirty"
            size="lg"
            class="uppercase my-0.5 !h-10"
            @click="saveOrganizationName"
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

          <VcButton
            v-if="userCanEditOrganization"
            class="px-3 uppercase"
            size="sm"
            is-outline
            @click="openAddOrUpdateCompanyAddressDialog()"
          >
            <span class="sm:hidden">{{ $t("pages.company.info.buttons.add_new_address_mobile") }}</span>
            <span class="hidden sm:inline">{{ $t("pages.company.info.buttons.add_new_address") }}</span>
          </VcButton>
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

          <template #button v-if="userCanEditOrganization">
            <VcButton class="px-4 uppercase" size="lg" @click="openAddOrUpdateCompanyAddressDialog()">
              <i class="fa fa-plus -ml-px mr-3" />
              {{ $t("pages.company.info.buttons.add_new_address") }}
            </VcButton>
          </template>
        </VcEmptyView>

        <div v-else class="flex flex-col md:rounded md:border">
          <VcTable
            :loading="loadingAddresses"
            :item-actions-builder="itemActionsBuilder"
            :columns="columns"
            :items="paginatedAddresses"
            :sort="sort"
            :pages="pages"
            :page="page"
            layout="table-auto"
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

                  <span class="leading-tight font-bold overflow-hidden overflow-ellipsis">
                    <span>{{ item.line1 }}</span>
                    <template v-if="item.city">, {{ item.city }}</template>
                    <template v-if="item.regionName">, {{ item.regionName }}</template>
                  </span>
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
              <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-gray-50">
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
                  :class="{ 'text-right': !userCanEditOrganization }"
                  class="px-5 py-3 overflow-hidden overflow-ellipsis"
                >
                  <div v-if="address.isDefault" class="inline-flex flex-row items-center">
                    <i class="fas fa-check mr-1 text-17 text-[color:var(--color-primary)]" />
                    <b v-t="'pages.company.info.labels.default'" />
                  </div>
                </td>

                <td v-if="userCanEditOrganization" class="px-5 py-3 text-right relative">
                  <VcActionDropdownMenu>
                    <button
                      class="flex items-center p-3 whitespace-nowrap"
                      @click="openAddOrUpdateCompanyAddressDialog(address)"
                    >
                      <i class="fas fa-pencil-alt mr-2 leading-none text-base text-[color:var(--color-warning)]" />
                      <span class="text-15 font-medium">{{ $t("common.buttons.edit") }}</span>
                    </button>

                    <button
                      :disabled="address.isDefault"
                      :class="{ 'text-gray-400': address.isDefault }"
                      :title="address.isDefault ? $t('pages.company.info.address_not_delete_message') : undefined"
                      class="flex items-center p-3 whitespace-nowrap"
                      @click="openDeleteAddressDialog(address)"
                    >
                      <i
                        :class="{ 'text-[color:var(--color-danger)]': !address.isDefault }"
                        class="fas fa-times mr-2 leading-none text-xl"
                      />
                      <span class="text-15 font-medium">{{ $t("common.buttons.delete") }}</span>
                    </button>
                  </VcActionDropdownMenu>
                </td>
              </tr>
            </template>

            <template #desktop-skeleton>
              <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
                <td v-for="column in columns.length" class="px-5 py-4" :key="column">
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
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { computedEager } from "@vueuse/core";
import { useField } from "vee-validate";
import * as yup from "yup";
import { MemberAddressType } from "@/xapi";
import { AddressType, getAddressName, getNewSorting, usePageHead, XApiPermissions } from "@/core";
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddOrUpdateCompanyAddressDialog, useOrganization, useOrganizationAddresses } from "@/shared/company";
import { useNotifications } from "@/shared/notification";

const page = ref(1);
const itemsPerPage = ref(10);

const { t } = useI18n();

usePageHead({
  title: t("pages.company.info.meta.title"),
});

/**
 * This page is accessible only to members of the organization,
 * so the organization must exist.
 */
const { loading: loadingUser, organization, checkPermissions } = useUser();
const { loading: loadingOrganization, updateOrganization } = useOrganization();
const {
  addresses,
  sort,
  fetchAddresses,
  removeAddresses,
  addOrUpdateAddresses,
  loading: loadingAddresses,
} = useOrganizationAddresses(organization.value!.id);
const {
  meta,
  errors,
  value: organizationName,
  resetField: resetOrganizationField,
} = useField<string>("organizationName", yup.string().max(64).required());
const { openPopup } = usePopup();
const notifications = useNotifications();

const organizationId = computed<string>(() => organization.value!.id);
const userCanEditOrganization = computedEager<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));

const pages = computed<number>(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed<MemberAddressType[]>(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

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

  if (userCanEditOrganization.value) {
    // Add action column
    result.push({
      id: "id",
      classes: "w-20",
    });
  }

  return result;
});

async function onPageChange(newPage: number) {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
}

async function applySorting(column: string) {
  sort.value = getNewSorting(sort.value, column);
  page.value = 1;
  await fetchAddresses();
}

async function saveOrganizationName() {
  await updateOrganization({
    id: organizationId.value,
    name: organizationName.value,
  });
}

async function openDeleteAddressDialog(address: MemberAddressType) {
  if (address.isDefault) {
    return;
  }

  const closeDeleteAddressDialog = openPopup({
    component: "VcConfirmationDialog",
    props: {
      variant: "danger",
      iconVariant: "danger",
      loading: loadingAddresses,
      title: t("shared.company.delete_address_dialog.title"),
      text: t("shared.company.delete_address_dialog.text"),
      async onConfirm() {
        const previousPagesCount = pages.value;

        await removeAddresses([address]);

        notifications.success({
          text: t("pages.company.info.address_deletion_successful_message", { addressName: getAddressName(address) }),
          duration: 10000,
          single: true,
        });

        /**
         * If you were on the last page, and after deleting the product
         * the number of pages has decreased, go to the previous page
         */
        if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
          page.value -= 1;
        }

        closeDeleteAddressDialog();
      },
    },
  });
}

async function openAddOrUpdateCompanyAddressDialog(address?: MemberAddressType): Promise<void> {
  const closeAddOrUpdateAddressDialog = openPopup({
    component: AddOrUpdateCompanyAddressDialog,
    props: {
      address,
      loading: loadingAddresses,
      async onResult(updatedAddress: MemberAddressType): Promise<void> {
        updatedAddress.addressType = AddressType.BillingAndShipping;

        await addOrUpdateAddresses([updatedAddress]);

        notifications.success({
          text: t("pages.company.info.address_saved_successful_message", {
            addressName: getAddressName(updatedAddress),
          }),
          duration: 10000,
          single: true,
        });

        closeAddOrUpdateAddressDialog();
      },
    },
  });
}

function itemActionsBuilder(inputObject: MemberAddressType) {
  const actions: SlidingActionsItem[] = [];

  if (userCanEditOrganization.value) {
    actions.push(
      {
        icon: "fas fa-trash-alt",
        title: t("common.buttons.delete"),
        left: true,
        classes: inputObject.isDefault ? "bg-gray-200" : "bg-[color:var(--color-danger)]",
        clickHandler(address: MemberAddressType) {
          openDeleteAddressDialog(address);
        },
      },
      {
        icon: "fas fa-pencil-alt",
        title: t("common.buttons.edit"),
        classes: "bg-gray-550",
        clickHandler(address: MemberAddressType) {
          openAddOrUpdateCompanyAddressDialog(address);
        },
      }
    );
  }

  return actions;
}

fetchAddresses();

watch(
  () => organization.value!.name!,
  (name) => resetOrganizationField({ value: name }),
  { immediate: true }
);
</script>
