<template>
  <div>
    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 class="truncate text-3xl font-bold uppercase text-gray-800">
        {{ $t("common.titles.addresses") }}
      </h2>

      <VcButton
        v-if="paginatedAddresses.length"
        class="px-3 uppercase"
        size="sm"
        is-outline
        @click="openAddOrUpdateAddressModal()"
      >
        <span class="sm:hidden">{{ $t("common.buttons.add_new") }}</span>
        <span class="hidden sm:inline">{{ $t("common.buttons.add_new_address") }}</span>
      </VcButton>
    </div>

    <VcEmptyView v-if="!paginatedAddresses.length && !addressesLoading" :text="$t('common.messages.no_addresses')">
      <template #icon>
        <VcImage :alt="$t('common.labels.addresses_icon')" src="/static/images/account/icons/no-addresses.svg" />
      </template>

      <template #button>
        <VcButton class="px-4 uppercase" size="lg" @click="openAddOrUpdateAddressModal()">
          <i class="fa fa-plus -ml-px mr-3" />
          {{ $t("common.buttons.add_new_address") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <!-- View Table -->
      <VcTable
        :loading="addressesLoading"
        :item-actions-builder="itemActionsBuilder"
        :columns="columns"
        :sort="sort"
        :items="paginatedAddresses"
        :pages="pages"
        :page="page"
        @page-changed="onPageChange"
        @header-click="applySorting"
      >
        <template #mobile-item="itemData">
          <div class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.recipient_name") }}
              </span>

              <span class="overflow-hidden text-ellipsis pr-4 font-extrabold">
                {{ itemData.item.firstName }} {{ itemData.item.lastName }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.address") }}
              </span>

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
                {{ itemData.item.line1 }}
                {{ itemData.item.postalCode }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("commmon.labels.phone") }}
              </span>

              <span class="overflow-hidden text-ellipsis pr-4">
                {{ itemData.item.phone }}
              </span>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.email") }}
              </span>

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.email }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.recipient_name") }}
              </span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.address") }}
              </span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.phone") }}
              </span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span class="text-sm text-gray-400">
                {{ $t("common.labels.email") }}
              </span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-gray-50">
            <td class="overflow-hidden text-ellipsis p-5">{{ address.firstName }} {{ address.lastName }}</td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
              {{ address.postalCode }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.phone }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.email }}
            </td>
            <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
            <td class="p-5 text-center">
              <div class="inline-block space-x-2">
                <!-- todo: use VcButton -->
                <button
                  type="button"
                  class="h-7 w-7 rounded text-[color:var(--color-primary)] shadow hover:bg-gray-100"
                  :title="$t('common.buttons.edit')"
                  @click="openAddOrUpdateAddressModal(address)"
                >
                  <i class="fas fa-pencil-alt" />
                </button>

                <button
                  type="button"
                  class="h-7 w-7 rounded text-[color:var(--color-danger)] shadow hover:bg-gray-100"
                  :title="$t('common.buttons.delete')"
                  @click="removeAddress(address)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="w-4/12 p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries, usePageHead } from "@/core/composables";
import { AddressType } from "@/core/enums";
import { useUserAddresses } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { VcAddOrUpdateAddressModal } from "@/ui-kit/components";
import type { ISortInfo } from "@/core/types";
import type { MemberAddressType } from "@/xapi/types";

const { t } = useI18n();
const { countries, loadCountries } = useCountries();
const {
  loading: addressesLoading,
  addresses,
  sort,
  fetchAddresses,
  removeAddresses,
  addOrUpdateAddresses,
} = useUserAddresses();
const { openPopup, closePopup } = usePopup();

usePageHead({
  title: t("pages.account.addresses.meta.title"),
});

const page = ref(1);
const itemsPerPage = ref(6);

const pages = computed<number>(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed<MemberAddressType[]>(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const columns = computed<ITableColumn[]>(() => [
  {
    id: "firstName",
    title: t("common.labels.recipient_name"),
    sortable: true,
  },
  {
    id: "countryCode",
    title: t("common.labels.address"),
    sortable: true,
  },
  {
    id: "phone",
    title: t("common.labels.phone"),
    sortable: true,
  },
  {
    id: "email",
    title: t("common.labels.email"),
    sortable: true,
  },
  {
    id: "actions",
    title: t("common.labels.actions"),
    align: "center",
  },
]);

const onPageChange = async (newPage: number) => {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
};

function openAddOrUpdateAddressModal(address?: MemberAddressType): void {
  openPopup({
    component: VcAddOrUpdateAddressModal,
    props: {
      address,

      async onResult(updatedAddress: MemberAddressType) {
        await addOrUpdateAddresses([{ ...updatedAddress, addressType: AddressType.BillingAndShipping }]);
        closePopup();
      },
    },
  });
}

function itemActionsBuilder() {
  const actions: SlidingActionsItem[] = [
    {
      icon: "fas fa-pencil-alt",
      title: t("common.buttons.edit"),
      classes: "bg-gray-550",
      clickHandler(address: MemberAddressType) {
        openAddOrUpdateAddressModal(address);
      },
    },
    {
      icon: "fas fa-trash-alt",
      title: t("common.buttons.delete"),
      left: true,
      classes: "bg-[color:var(--color-danger)]",
      clickHandler(address: MemberAddressType) {
        removeAddress(address);
      },
    },
  ];

  return actions;
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = sortInfo;
  page.value = 1;
  await fetchAddresses();
}

async function removeAddress(address: MemberAddressType): Promise<void> {
  if (!window.confirm(t("common.messages.confirm_delete_address"))) {
    return;
  }

  const previousPagesCount = pages.value;

  await removeAddresses([address]);

  /**
   * If you were on the last page, and after deleting the product
   * the number of pages has decreased, go to the previous page
   */
  if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
    page.value -= 1;
  }
}

onMounted(async () => {
  await fetchAddresses();

  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
