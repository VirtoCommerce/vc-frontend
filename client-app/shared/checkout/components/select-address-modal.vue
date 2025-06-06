<template>
  <VcModal :title="$t('shared.checkout.select_address_modal.title')" max-width="60rem" is-mobile-fullscreen dividers>
    <template #actions="{ close }">
      <div class="flex w-full flex-wrap items-center gap-3">
        <div v-if="pages > 1" class="w-full sm:w-auto sm:grow">
          <VcPagination
            v-model:page="page"
            class="flex justify-center sm:block"
            :pages="Math.min(pages, PAGE_LIMIT)"
            compact
          />

          <VcInputDetails v-if="page >= PAGE_LIMIT" :message="$t('ui_kit.reach_limit.page_limit')" />
        </div>

        <div class="flex w-full flex-wrap gap-3 max-xs:*:grow sm:ms-auto sm:w-auto">
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
            @click="close"
          >
            {{ $t("shared.checkout.select_address_modal.cancel_button") }}
          </VcButton>

          <VcButton
            no-wrap
            :disabled="!selectedAddress"
            class="ms-auto sm:ms-3"
            min-width="8rem"
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

    <div class="rounded border">
      <VcTable
        :columns="columns"
        :items="paginatedAddresses"
        :description="$t('shared.checkout.select_address_modal.meta.table_description')"
        @page-changed="onPageChange"
      >
        <template #mobile-item="itemData">
          <div class="flex items-center space-x-3 border-b p-4 last:border-none">
            <div class="w-2/3 grow truncate">
              <VcBadge v-if="itemData.item.isFavorite" size="sm" variant="outline-dark" rounded>
                <VcIcon name="whishlist" />
                <span>{{ $t("pages.company.info.labels.favorite") }}</span>
              </VcBadge>

              <p class="text-base font-bold">
                <span v-if="isCorporateAddresses" class="text-base font-bold">
                  {{ itemData.item.line1 }}<br />
                  <template v-if="itemData.item.line2">{{ itemData.item.line2 }}<br /></template>
                  {{ itemData.item.city }},
                  <template v-if="itemData.item.regionId">{{ itemData.item.regionId }}, </template>
                  {{ itemData.item.postalCode }}
                </span>
                <span v-else>{{ itemData.item.firstName }} {{ itemData.item.lastName }}</span>
              </p>

              <p class="text-sm">
                <span v-if="isCorporateAddresses">
                  {{ isMemberAddressType(itemData.item) ? itemData.item.description : "" }}
                </span>
                <span v-else>
                  {{ itemData.item.line1 }}<br />
                  <template v-if="itemData.item.line2">{{ itemData.item.line2 }}<br /></template>
                  {{ itemData.item.city }},
                  <template v-if="itemData.item.regionId">{{ itemData.item.regionId }}, </template>
                  {{ itemData.item.postalCode }}
                </span>
              </p>

              <p class="text-sm text-neutral-400">
                <span v-if="!isCorporateAddresses && !!itemData.item.phone">
                  <span class="font-bold">{{ $t("common.labels.phone") }}: </span>
                  {{ itemData.item.phone }}
                </span>
              </p>

              <p class="text-sm text-neutral-400">
                <span v-if="isCorporateAddresses">{{ itemData.item.countryName }}</span>
                <span v-else-if="!!itemData.item.email">
                  <span class="font-bold">{{ $t("common.labels.email") }}: </span>
                  {{ itemData.item.email }}
                </span>
              </p>
            </div>

            <div class="w-1/3 max-w-24 text-center">
              <VcIcon v-if="itemData.item.id === selectedAddress?.id" class="fill-success" name="check-circle" />

              <VcButton v-else variant="outline" size="sm" full-width truncate @click="setAddress(itemData.item)">
                {{ $t("shared.checkout.select_address_modal.select_button") }}
              </VcButton>
            </div>
          </div>
        </template>

        <template #mobile-empty>
          <div class="flex items-center space-x-3 border-b border-neutral-200 p-6">
            {{ $t("shared.checkout.select_address_modal.no_addresses_message") }}
          </div>
        </template>

        <template #desktop-body>
          <tr v-for="(address, index) in paginatedAddresses" :key="address.id" :class="{ 'bg-neutral-50': index % 2 }">
            <td v-if="hasFavoriteAddresses" class="truncate p-5">
              <VcIcon v-if="address.isFavorite" class="fill-primary" name="whishlist" size="md" />
            </td>

            <td class="truncate p-5">
              <span v-if="isCorporateAddresses">
                {{ address.line1 }}<br />
                <template v-if="address.line2">{{ address.line2 }}<br /></template>
                {{ address.city }},
                <template v-if="address.regionId">{{ address.regionId }}, </template>
                {{ address.postalCode }}
              </span>
              <span v-else> {{ address.firstName }} {{ address.lastName }} </span>
            </td>

            <td class="truncate p-5">
              <span v-if="isCorporateAddresses">
                {{ isMemberAddressType(address) ? address.description : "" }}
              </span>
              <span v-else>
                {{ address.line1 }}<br />
                <template v-if="address.line2">{{ address.line2 }}<br /></template>
                {{ address.city }},
                <template v-if="address.regionId">{{ address.regionId }}, </template>
                {{ address.postalCode }}
              </span>
            </td>

            <td v-if="!isCorporateAddresses" class="truncate p-5">
              {{ address.phone }}
            </td>

            <td class="truncate p-5">
              <span v-if="isCorporateAddresses">
                {{ address.countryName }}
              </span>
              <span v-else>
                {{ address.email }}
              </span>
            </td>

            <td class="p-5 text-center">
              <VcIcon v-if="address.id === selectedAddress?.id" class="fill-success" name="check-circle" />

              <VcButton v-else variant="outline" size="sm" min-width="6.25rem" @click="setAddress(address)">
                {{ $t("shared.checkout.select_address_modal.select_button") }}
              </VcButton>
            </td>
          </tr>
        </template>

        <template #desktop-empty>
          <!-- Workaround for using colspan -->
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td colspan="5">
              <div class="flex items-center border-b border-neutral-200 p-5">
                <span class="text-base">
                  {{ $t("shared.checkout.select_address_modal.no_addresses_message") }}
                </span>
              </div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, watchEffect, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PAGE_LIMIT } from "@/core/constants";
import { isEqualAddresses, isMemberAddressType } from "@/core/utilities";
import type { AnyAddressType } from "@/core/types";

interface IProps {
  currentAddress?: AnyAddressType;
  addresses?: AnyAddressType[];
  isCorporateAddresses: boolean;
  allowAddNewAddress?: boolean;
  omitFieldsOnCompare?: (keyof AnyAddressType)[];
}

interface IEmits {
  (event: "result", value: AnyAddressType): void;
  (event: "addNewAddress"): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
  allowAddNewAddress: true,
  omitFieldsOnCompare: () => [],
});

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const selectedAddress = ref<AnyAddressType>();
const page = ref(1);
const itemsPerPage = ref(4);

const pages = computed(() => Math.ceil(props.addresses.length / itemsPerPage.value));
const paginatedAddresses = computed(() =>
  props.addresses.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);
const hasFavoriteAddresses = computed(() => props.addresses.some((item) => item.isFavorite));

const columns = computed<ITableColumn[]>(() => {
  const cols: ITableColumn[] = props.isCorporateAddresses
    ? [
        { id: "name", title: t("common.labels.address") },
        { id: "description", title: t("common.labels.description") },
        { id: "countryName", title: t("common.labels.country") },
        { id: "id", title: t("common.labels.active_address"), align: "center" },
      ]
    : [
        { id: "firstName", title: t("common.labels.recipient_name") },
        { id: "name", title: t("common.labels.address") },
        { id: "phone", title: t("common.labels.phone") },
        { id: "email", title: t("common.labels.email") },
        { id: "id", title: t("common.labels.active_address"), align: "center" },
      ];

  if (hasFavoriteAddresses.value) {
    return [{ id: "isFavorite", classes: "w-12" } as ITableColumn].concat(cols);
  }

  return cols;
});

function onPageChange(newPage: number): void {
  page.value = newPage;
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
