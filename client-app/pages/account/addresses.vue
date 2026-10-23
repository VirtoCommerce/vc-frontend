<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
      <VcTypography tag="h1">
        {{ $t("common.titles.addresses") }}
      </VcTypography>

      <VcButton v-if="addresses.length" size="sm" variant="outline" @click="openAddOrUpdateAddressModal()">
        <span class="sm:hidden">{{ $t("common.buttons.add_new") }}</span>

        <span class="hidden sm:inline">{{ $t("common.buttons.add_new_address") }}</span>
      </VcButton>
    </div>

    <VcEmptyView
      v-if="!addresses.length && !addressesLoading"
      :text="$t('common.messages.no_addresses')"
      icon="outline-address"
    >
      <template #button>
        <VcButton prepend-icon="plus" @click="openAddOrUpdateAddressModal()">
          {{ $t("common.buttons.add_new_address") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <VcWidget v-else size="lg" mobile-flat>
      <template #default-container>
        <!-- View Table -->
        <VcTable
          :loading="addressesLoading"
          :columns="columns"
          :sort="sort"
          :items="addresses"
          :pages="pages"
          :page="page"
          :description="$t('pages.account.addresses.meta.table_description')"
          mobile-breakpoint="lg"
          mobile-cards
          @page-changed="onPageChange"
          @header-click="applySorting"
        >
          <template #mobile-item="{ item }">
            <VcRecordCard :title="toCSV([item.firstName, item.lastName], ' ')" :meta="getAddressMeta(item)">
              <template #description>
                <span class="block">{{ toCSV([item.line1, item.line2]) }}</span>

                <span class="block">{{ toCSV([item.city, item.regionName, item.countryCode, item.postalCode]) }}</span>
              </template>

              <template #actions>
                <AddressDropdownMenu
                  :address="item"
                  compact
                  @edit="openAddOrUpdateAddressModal(item)"
                  @delete="removeAddress(item)"
                />
              </template>

              <template v-if="item.isDefault" #status>
                <VcBadge color="warning" variant="outline" size="sm" rounded nowrap>
                  <VcIcon name="star" />

                  <span>{{ $t("common.labels.default") }}</span>
                </VcBadge>
              </template>
            </VcRecordCard>
          </template>

          <template #desktop-body>
            <tr v-for="address in addresses" :key="address.id" class="even:bg-neutral-50">
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
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries, usePageHead } from "@/core/composables";
import { AddressType } from "@/core/enums";
import { toCSV } from "@/core/utilities";
import { AddressDropdownMenu, useCustomerAddresses } from "@/shared/account";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { MemberAddressFieldsFragment } from "@/core/api/graphql/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

const { t } = useI18n();
const { countries, loadCountries } = useCountries();
const {
  loading: addressesLoading,
  sort,
  page,
  pages,
  addresses,
  removeAddresses,
  addOrUpdateAddresses,
} = useCustomerAddresses();
const { openModal, closeModal } = useModal();
const notifications = useNotifications();

usePageHead({
  title: t("pages.account.addresses.meta.title"),
});

const columns = computed<VcTableColumnType[]>(() => [
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

function getAddressMeta(address: MemberAddressFieldsFragment): VcRecordCardMetaItemType[] {
  const meta: VcRecordCardMetaItemType[] = [];

  if (address.organization) {
    meta.push({ icon: "building-2", text: address.organization });
  } else if (address.email) {
    meta.push({ icon: "mail", text: address.email });
  }

  if (address.phone) {
    meta.push({ icon: "phone", text: address.phone });
  }

  return meta;
}

function onPageChange(newPage: number): void {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
}

function openAddOrUpdateAddressModal(address?: MemberAddressFieldsFragment): void {
  openModal({
    component: AddOrUpdateAddressModal,
    props: {
      address,
      loading: addressesLoading,

      async onResult(updatedAddress: MemberAddressFieldsFragment) {
        await addOrUpdateAddresses([{ ...updatedAddress, addressType: AddressType.BillingAndShipping }]);
        closeModal();
      },
    },
  });
}

function applySorting(sortInfo: VcTableSortInfoType): void {
  sort.value = sortInfo;
  page.value = 1;
}

function removeAddress(address: MemberAddressFieldsFragment): void {
  const closeDeleteAddressModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
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
  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
