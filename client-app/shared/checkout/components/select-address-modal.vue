<template>
  <VcModal :title="$t('shared.checkout.select_address_modal.title')" modal-width="max-w-5xl" is-mobile-fullscreen>
    <template #actions="{ close }">
      <VcButton
        v-if="!isCorporateAddresses || $can($permissions.xApi.CanEditOrganization)"
        class="me-auto"
        variant="outline"
        no-wrap
        @click="
          $emit('addNewAddress');
          close();
        "
      >
        {{ $t("shared.checkout.select_address_modal.add_address_button") }}
      </VcButton>

      <VcButton color="secondary" variant="outline" class="flex-none max-md:!hidden" @click="close">
        {{ $t("shared.checkout.select_address_modal.cancel_button") }}
      </VcButton>

      <VcButton
        class="xs:flex-none"
        no-wrap
        :disabled="!selectedAddress"
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
    </template>

    <VcTable
      :columns="columns"
      :items="paginatedAddresses"
      :pages="pages"
      :page="page"
      :description="$t('shared.checkout.select_address_modal.meta.table_description')"
      @page-changed="onPageChange"
    >
      <template #mobile-item="itemData">
        <div class="flex items-center space-x-3 border-b border-neutral-200 p-6">
          <div class="w-1/2 grow truncate">
            <VcBadge v-if="isFavoriteAddress(itemData.item)" size="sm" variant="outline-dark" rounded>
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
                <span class="font-semibold">{{ $t("common.labels.phone") }}: </span>
                {{ itemData.item.phone }}
              </span>
            </p>

            <p class="text-sm text-neutral-400">
              <span v-if="isCorporateAddresses">{{ itemData.item.countryName }}</span>
              <span v-else-if="!!itemData.item.email">
                <span class="font-semibold">{{ $t("common.labels.email") }}: </span>
                {{ itemData.item.email }}
              </span>
            </p>
          </div>

          <div v-if="itemData.item.id === selectedAddress?.id" class="w-1/4 text-center">
            <VcIcon class="text-[--color-success-500]" name="check-circle" />
          </div>

          <div v-else class="w-1/4">
            <button
              v-t="'shared.checkout.select_address_modal.select_button'"
              type="button"
              class="mx-auto flex h-9 grow items-center justify-center rounded border-2 border-primary px-3 font-roboto-condensed text-base font-bold uppercase text-primary hover:bg-primary hover:text-additional-50 focus:outline-none"
              @click="setAddress(itemData.item)"
            ></button>
          </div>
        </div>
      </template>

      <template #mobile-empty>
        <div
          v-t="'shared.checkout.select_address_modal.no_addresses_message'"
          class="flex items-center space-x-3 border-b border-neutral-200 p-6"
        ></div>
      </template>

      <template #desktop-body>
        <tr v-for="(address, index) in paginatedAddresses" :key="address.id" :class="{ 'bg-neutral-50': index % 2 }">
          <td v-if="hasFavoriteAddresses" class="truncate p-5">
            <VcIcon v-if="isFavoriteAddress(address)" class="text-primary" name="whishlist" size="md" />
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

          <td v-if="address.id === selectedAddress?.id" class="p-5 text-center">
            <VcIcon class="text-[--color-success-500]" name="check-circle" />
          </td>
          <td v-else class="p-5">
            <button
              v-t="'shared.checkout.select_address_modal.select_button'"
              type="button"
              class="mx-auto flex h-9 grow items-center justify-center rounded border-2 border-primary px-3 font-roboto-condensed text-base font-bold uppercase text-primary hover:bg-primary hover:text-additional-50 focus:outline-none"
              @click="setAddress(address)"
            ></button>
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
              <span v-t="'shared.checkout.select_address_modal.no_addresses_message'" class="text-base"></span>
            </div>
          </td>
        </tr>
      </template>

      <template #footer>
        <div v-if="pages > 1" class="flex justify-start border-b border-neutral-200">
          <VcPagination v-model:page="page" :pages="pages" class="mt-5 self-start px-5 pb-5"></VcPagination>
        </div>
      </template>
    </VcTable>
  </VcModal>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, watchEffect, ref } from "vue";
import { useI18n } from "vue-i18n";
import { isEqualAddresses, isMemberAddressType } from "@/core/utilities";
import type { AnyAddressType } from "@/core/types";

interface IProps {
  currentAddress?: AnyAddressType;
  addresses?: AnyAddressType[];
  isCorporateAddresses: boolean;
}

interface IEmits {
  (event: "result", value: AnyAddressType): void;
  (event: "addNewAddress"): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
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
const hasFavoriteAddresses = computed(() => props.addresses.some((item) => isFavoriteAddress(item)));

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

function isFavoriteAddress(address: AnyAddressType): boolean {
  return "isFavorite" in address && address.isFavorite;
}

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
  selectedAddress.value = props.addresses.find((item) => isEqualAddresses(item, props.currentAddress!));
});
</script>
