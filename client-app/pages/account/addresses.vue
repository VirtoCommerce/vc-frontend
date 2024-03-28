<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
      <VcTypography tag="h1">
        {{ $t("common.titles.addresses") }}
      </VcTypography>

      <VcButton v-if="paginatedAddresses.length" size="sm" variant="outline" @click="openAddOrUpdateAddressModal()">
        <span class="sm:hidden">{{ $t("common.buttons.add_new") }}</span>
        <span class="hidden sm:inline">{{ $t("common.buttons.add_new_address") }}</span>
      </VcButton>
    </div>

    <VcEmptyView v-if="!paginatedAddresses.length && !addressesLoading" :text="$t('common.messages.no_addresses')">
      <template #icon>
        <VcImage :alt="$t('common.labels.addresses_icon')" src="/static/images/account/icons/no-addresses.svg" />
      </template>

      <template #button>
        <VcButton prepend-icon="plus" @click="openAddOrUpdateAddressModal()">
          {{ $t("common.buttons.add_new_address") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <VcWidget v-else size="lg">
      <template #default-container>
        <!-- View Table -->
        <VcTable
          :loading="addressesLoading"
          :columns="columns"
          :sort="sort"
          :items="paginatedAddresses"
          :pages="pages"
          :page="page"
          :description="$t('pages.account.addresses.meta.table_description')"
          @page-changed="onPageChange"
          @header-click="applySorting"
        >
          <template #mobile-item="itemData">
            <div class="relative grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
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
                  {{ $t("common.labels.phone") }}
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

              <AddressDropdownMenu
                class="absolute right-4 top-3"
                :address="itemData.item"
                placement="left-start"
                @edit="openAddOrUpdateAddressModal(itemData.item)"
                @delete="removeAddress(itemData.item)"
              />
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

              <td class="p-5 text-end">
                <AddressDropdownMenu
                  class="inline-block"
                  :address="address"
                  @edit="openAddOrUpdateAddressModal(address)"
                  @delete="removeAddress(address)"
                />
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
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries, usePageHead } from "@/core/composables";
import { AddressType } from "@/core/enums";
import { AddressDropdownMenu, useUserAddresses } from "@/shared/account";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

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
const { openModal, closeModal } = useModal();
const notifications = useNotifications();

usePageHead({
  title: t("pages.account.addresses.meta.title"),
});

const page = ref(1);
const itemsPerPage = ref(6);

const pages = computed<number>(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed<MemberAddressType[]>(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
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
]);

function onPageChange(newPage: number): void {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
}

function openAddOrUpdateAddressModal(address?: MemberAddressType): void {
  openModal({
    component: AddOrUpdateAddressModal,
    props: {
      address,
      loading: addressesLoading,

      async onResult(updatedAddress: MemberAddressType) {
        await addOrUpdateAddresses([{ ...updatedAddress, addressType: AddressType.BillingAndShipping }]);
        closeModal();
      },
    },
  });
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = sortInfo;
  page.value = 1;
  await fetchAddresses();
}

function removeAddress(address: MemberAddressType): void {
  const closeDeleteAddressModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      iconVariant: "danger",
      loading: addressesLoading,
      title: t("common.titles.delete_address"),
      text: t("common.messages.confirm_delete_address"),

      async onConfirm() {
        const previousPagesCount = pages.value;

        await removeAddresses([address]);

        notifications.success({
          text: t("common.messages.address_deletion_successful"),
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

        closeDeleteAddressModal();
      },
    },
  });
}

onMounted(async () => {
  await fetchAddresses();

  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
