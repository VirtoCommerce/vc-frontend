<template>
  <VcModal
    :title="$t('shared.checkout.select_address_modal.title')"
    max-width="60rem"
    is-mobile-fullscreen
    dividers
    test-id="select-address-modal"
  >
    <VcAlert class="mb-4 lg:hidden" icon="check-circle" size="sm" variant="solid-light">
      {{ $t("shared.checkout.select_address_modal.message") }}
    </VcAlert>

    <template #actions="{ close }">
      <div class="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <div v-if="pages > 1" class="flex w-full min-w-0 flex-col items-center md:items-start">
          <VcPagination v-model:page="page" :pages="Math.min(pages, PAGE_LIMIT)" compact @update:page="onPageChange" />

          <VcInputDetails v-if="page >= PAGE_LIMIT" :message="$t('ui_kit.reach_limit.page_limit')" />
        </div>

        <div class="flex gap-3 *:flex-1">
          <VcButton
            v-if="allowAddNewAddress && (!isCorporateAddresses || $can($permissions.xApi.CanEditOrganization))"
            variant="outline"
            no-wrap
            min-width="8rem"
            @click="
              $emit('addNewAddress');
              close();
            "
          >
            {{ $t("shared.checkout.select_address_modal.add_address_button") }}
          </VcButton>

          <VcButton
            v-else
            no-wrap
            min-width="8rem"
            color="secondary"
            variant="outline"
            class="flex-none max-md:!hidden"
            data-test-id="close-button"
            @click="close"
          >
            {{ $t("shared.checkout.select_address_modal.cancel_button") }}
          </VcButton>

          <VcButton
            no-wrap
            :disabled="!selectedAddress"
            min-width="8rem"
            data-test-id="confirm-button"
            @click="
              save();
              close();
            "
          >
            {{
              isMobile
                ? $t("shared.checkout.select_address_modal.save_button")
                : $t("shared.checkout.select_address_modal.ok_button")
            }}
          </VcButton>
        </div>
      </div>
    </template>

    <SelectAddressFilter v-if="showFilters" @applyFilter="applyFilter" />

    <VcTable
      :columns="columns"
      :items="paginatedAddresses"
      :description="$t('shared.checkout.select_address_modal.meta.table_description')"
      :loading="loading"
      bordered
      @page-changed="onPageChange"
    >
      <template #mobile-item="{ item }">
        <div class="relative flex items-center space-x-3 border-b p-4 last:border-none">
          <div class="w-2/3 grow">
            <div class="mb-2.5 flex items-center gap-2 empty:hidden">
              <VcBadge v-if="item.isFavorite" size="sm" variant="outline-dark" rounded color="warning">
                <VcIcon name="whishlist" />

                <span>{{ $t("pages.company.info.labels.favorite") }}</span>
              </VcBadge>

              <VcBadge
                v-if="isEqualAddresses(item, currentAddress ?? {}, { omitFields: props.omitFieldsOnCompare })"
                size="sm"
                variant="outline-dark"
                rounded
                color="success"
              >
                <VcIcon name="check" />

                <span>{{ $t("common.labels.active_address") }}</span>
              </VcBadge>
            </div>

            <div class="text-sm font-bold">
              <span v-if="isCorporateAddresses">
                {{ getFormattedAddress(item) }}
              </span>

              <span v-else>{{ item.firstName }} {{ item.lastName }}</span>
            </div>

            <div class="text-sm">
              <span v-if="isCorporateAddresses">
                {{ isMemberAddressType(item) ? item.description : "" }}
              </span>

              <span v-else>
                {{ getFormattedAddress(item) }}
              </span>
            </div>

            <div class="text-sm text-neutral-400">
              <span v-if="!isCorporateAddresses && !!item.phone">
                <span class="font-bold">{{ $t("common.labels.phone") }}: </span>
                {{ item.phone }}
              </span>
            </div>

            <div class="text-sm text-neutral-400">
              <span v-if="isCorporateAddresses" class="text-xs">{{ item.countryName }}</span>

              <span v-else-if="!!item.email">
                <span class="font-bold">{{ $t("common.labels.email") }}: </span>
                {{ item.email }}
              </span>
            </div>

            <PickupAvailabilityInfo
              v-if="showAvailability"
              :availability-type="item.availabilityType"
              :availability-note="item.availabilityNote"
            />
          </div>

          <div class="w-10 flex-none text-center">
            <VcIcon v-if="item.id === selectedAddress?.id" class="fill-secondary" name="check-circle" :size="20" />
          </div>

          <button
            v-if="item.id !== selectedAddress?.id"
            type="button"
            class="absolute inset-0 opacity-0"
            @click="setAddress(item)"
          ></button>
        </div>
      </template>

      <template #mobile-empty>
        <div class="flex items-center space-x-3 border-b border-neutral-200 p-6">
          <span>{{ emptyText ?? $t("shared.checkout.select_address_modal.no_addresses_message") }}</span>

          <VcButton
            v-if="showFilters"
            icon="reset"
            @click="resetFilter"
            :aria-label="$t('pages.account.order_details.bopis.cart_pickup_points_reset_search')"
          />
        </div>
      </template>

      <template #desktop-item="{ item }">
        <tr
          :data-test-id="`customer-address-${item.id}`"
          :class="[
            'group border-b last:border-none hover:bg-secondary-50',
            { 'cursor-pointer': item.id !== selectedAddress?.id },
          ]"
          @click="setAddress(item)"
        >
          <td class="px-4 py-3.5">
            <span class="line-clamp-2">
              <VcIcon
                v-if="hasFavoriteAddresses && item.isFavorite"
                class="me-1.5 fill-accent"
                name="whishlist"
                :size="16"
              />

              <span v-if="isCorporateAddresses">
                {{ getFormattedAddress(item) }}
              </span>

              <span v-else> {{ item.firstName }} {{ item.lastName }} </span>
            </span>
          </td>

          <td class="px-4 py-3.5 [word-break:break-word]">
            <span v-if="isCorporateAddresses" class="line-clamp-2">
              {{ isMemberAddressType(item) ? item.description : "" }}
            </span>

            <span v-else class="line-clamp-2">
              {{ getFormattedAddress(item) }}
            </span>
          </td>

          <td v-if="!isCorporateAddresses" class="truncate px-4 py-3.5">
            {{ item.phone }}
          </td>

          <td class="truncate px-4 py-3.5">
            <span v-if="isCorporateAddresses">
              {{ item.countryName }}
            </span>

            <span v-else>
              {{ item.email }}
            </span>
          </td>

          <td v-if="showAvailability" class="truncate px-4 py-3.5">
            <PickupAvailabilityInfo
              :availability-type="item.availabilityType"
              :availability-note="item.availabilityNote"
            />
          </td>

          <td class="h-[3.75rem] py-2.5 text-center">
            <VcIcon v-if="item.id === selectedAddress?.id" class="fill-success" name="check-circle" />

            <VcButton v-else class="invisible group-hover:lg:visible" variant="outline" size="xs">
              {{ $t("shared.checkout.select_address_modal.select_button") }}
            </VcButton>
          </td>
        </tr>
      </template>

      <template #desktop-empty>
        <tr>
          <td :colspan="showAvailability ? 5 : 4">
            <div class="flex flex-col items-center p-5">
              <span class="text-base">
                {{ emptyText ?? $t("shared.checkout.select_address_modal.no_addresses_message") }}
              </span>

              <VcButton v-if="showFilters" class="mt-5" prepend-icon="reset" @click="resetFilter">
                {{ $t("pages.account.order_details.bopis.cart_pickup_points_reset_search") }}
              </VcButton>
            </div>
          </td>
        </tr>
      </template>
    </VcTable>
  </VcModal>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { PAGE_LIMIT } from "@/core/constants";
import { isEqualAddresses, isMemberAddressType } from "@/core/utilities";
import { SelectAddressFilter } from "@/shared/checkout";
import { providePickupFilterContext } from "@/shared/checkout/composables";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import type { IPickupFilterContext } from "@/shared/checkout/composables";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

type PaginationModeType = "client" | "server";

interface IProps {
  currentAddress?: AnyAddressType;
  addresses?: AnyAddressType[];
  isCorporateAddresses: boolean;
  allowAddNewAddress?: boolean;
  showAvailability?: boolean;
  emptyText?: string;
  omitFieldsOnCompare?: (keyof MemberAddressType)[];
  showFilters?: boolean;
  filterContext?: IPickupFilterContext;
  pageSize?: number;
  paginationMode?: PaginationModeType;
  loading?: boolean;
  totalCount?: number;
}

interface IEmits {
  (event: "result", value: AnyAddressType): void;
  (event: "addNewAddress"): void;
  (event: "filterChange"): void;
  (event: "resetFilter"): void;
  (event: "pageChange", page: number): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
  allowAddNewAddress: true,
  showAvailability: false,
  showFilters: false,
  omitFieldsOnCompare: () => [],
  pageSize: 6,
  paginationMode: "client",
  loading: false,
  totalCount: 0,
});

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

if (props.filterContext) {
  providePickupFilterContext(props.filterContext);
}

const filterIsApplied = props.filterContext?.filterIsApplied ?? ref(false);
const clearFilter = props.filterContext?.clearFilter ?? (() => {});
const pickupLocationsLoading = props.filterContext?.pickupLocationsLoading ?? ref(false);


function applyFilter() {
  page.value = 1;
  emit("filterChange");
}

function resetFilter() {
  emit("resetFilter");
  applyFilter();
}

const selectedAddress = ref<AnyAddressType>();
const page = ref(1);
const itemsPerPage = computed(() => props.pageSize);

const pages = computed(() => {
  const itemsTotal = props.paginationMode === "server" ? props.totalCount : props.addresses.length;
  return Math.max(1, Math.ceil(itemsTotal / itemsPerPage.value));
});
const paginatedAddresses = computed(() =>
  props.paginationMode === "server"
    ? props.addresses
    : props.addresses.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);
const hasFavoriteAddresses = computed(() => props.addresses.some((item) => item.isFavorite));

const columns = computed<VcTableColumnType[]>(() => {
  const cols: VcTableColumnType[] = props.isCorporateAddresses
    ? [
        { id: "name", title: t("common.labels.address") },
        { id: "description", title: t("common.labels.description") },
        { id: "countryName", title: t("common.labels.country"), classes: "w-40" },
        { id: "id", title: t("common.labels.active_address"), align: "center", classes: "w-40" },
      ]
    : [
        { id: "firstName", title: t("common.labels.recipient_name") },
        { id: "name", title: t("common.labels.address") },
        { id: "phone", title: t("common.labels.phone") },
        { id: "email", title: t("common.labels.email") },
        { id: "id", title: t("common.labels.active_address"), align: "center" },
      ];

  if (props.showAvailability) {
    cols.splice(cols.length - 1, 0, { id: "availability", title: t("pages.account.order_details.bopis.availability") });
  }

  return cols;
});

function getFormattedAddress(address: AnyAddressType): string {
  if (!address) {
    return "";
  }

  const parts = [address.line1, address.line2, address.city, address.regionId, address.postalCode].filter(
    (part) => typeof part === "string" && part.trim() !== "",
  );

  return parts.join(", ");
}

function onPageChange(): void {
  emit("pageChange", page.value);
}

function setAddress(address: AnyAddressType): void {
  selectedAddress.value = address;
}

function save(): void {
  if (selectedAddress.value) {
    emit("result", selectedAddress.value);
  }
}

watchEffect(() => {
  selectedAddress.value = props.addresses.find((item) =>
    isEqualAddresses(item, props.currentAddress ?? {}, { omitFields: props.omitFieldsOnCompare }),
  );
});
</script>
