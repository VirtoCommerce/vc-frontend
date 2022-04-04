<template>
  <VcPopup :title="$t('shared.checkout.select_address_dialog.title')" modal-width="max-w-5xl">
    <template #actions="{ close }">
      <VcButton
        class="uppercase lg:mr-auto px-2"
        :class="[isMobile && 'flex-grow w-1/2']"
        @click="
          $emit('addNewAddress');
          close();
        "
        is-outline
      >
        {{ $t("shared.checkout.select_address_dialog.add_address_button") }}
      </VcButton>

      <div class="flex space-x-3" :class="[isMobile ? 'flex-grow w-1/2' : 'w-auto']">
        <VcButton
          v-if="!isMobile"
          kind="secondary"
          class="w-1/2 md:w-auto uppercase flex-grow md:flex-grow-0 md:px-5"
          @click="close"
          is-outline
        >
          {{ $t("shared.checkout.select_address_dialog.cancel_button") }}
        </VcButton>

        <VcButton
          class="w-1/2 md:w-auto uppercase flex-grow md:flex-grow-0 md:px-10"
          @click="
            $emit('result', selectedAddress);
            close();
          "
        >
          {{
            isMobile
              ? $t("shared.checkout.select_address_dialog.save_button")
              : $t("shared.checkout.select_address_dialog.ok_button")
          }}
        </VcButton>
      </div>
    </template>

    <VcTable :columns="columns" :items="paginatedAddresses" :pages="pages" :page="page" @pageChanged="onPageChange">
      <template #mobile-item="itemData">
        <div class="flex items-center space-x-3 p-6 border-b border-gray-200">
          <div class="w-1/2 flex-grow">
            <span class="font-bold text-base">{{ itemData.item.firstName }} {{ itemData.item.lastName }}</span>
            <p class="text-sm">
              {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
              {{ itemData.item.line1 }}
              {{ itemData.item.postalCode }}
            </p>
            <p class="text-gray-400 text-sm"><span class="font-semibold">Phone: </span>{{ itemData.item.phone }}</p>
            <p class="text-gray-400 text-sm"><span class="font-semibold">Email: </span>{{ itemData.item.email }}</p>
          </div>

          <div v-if="itemData.item.id === selectedAddress?.id" class="w-1/4">
            <div class="flex items-center justify-center mx-auto rounded-full w-6 h-6 bg-green-600 text-white text-sm">
              <i class="fas fa-check"></i>
            </div>
          </div>

          <div v-else class="w-1/4">
            <button
              class="uppercase flex-grow flex items-center mx-auto justify-center px-3 h-9 font-roboto-condensed text-base font-bold border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white rounded focus:outline-none"
              @click="setAddress(itemData.item)"
              v-t="'shared.checkout.select_address_dialog.select_button'"
            ></button>
          </div>
        </div>
      </template>

      <template #mobile-empty>
        <div
          class="flex items-center space-x-3 p-6 border-b border-gray-200"
          v-t="'shared.checkout.select_address_dialog.no_addresses_message'"
        ></div>
      </template>

      <template #desktop-body>
        <tr v-for="(address, index) in paginatedAddresses" :key="address.id" :class="{ 'bg-gray-50': index % 2 }">
          <td class="p-5">{{ address.firstName }} {{ address.lastName }}</td>
          <td class="p-5">
            {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
            {{ address.postalCode }}
          </td>
          <td class="p-5">{{ address.phone }}</td>
          <td class="p-5">{{ address.email }}</td>
          <td v-if="address.id === selectedAddress?.id" class="p-5">
            <div class="flex items-center justify-center mx-auto rounded-full w-6 h-6 bg-green-600 text-white text-sm">
              <i class="fas fa-check"></i>
            </div>
          </td>
          <td v-else class="p-5">
            <button
              class="uppercase flex-grow flex items-center mx-auto justify-center px-3 h-9 font-roboto-condensed text-base font-bold border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white rounded focus:outline-none"
              @click="setAddress(address)"
              v-t="'shared.checkout.select_address_dialog.select_button'"
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
            <div class="flex items-center p-5 border-b border-gray-200">
              <span class="text-base" v-t="'shared.checkout.select_address_dialog.no_addresses_message'"></span>
            </div>
          </td>
        </tr>
      </template>

      <template #footer>
        <div v-if="pages > 1" class="flex justify-start border-b border-gray-200">
          <VcPagination v-model:page="page" :pages="pages" class="self-start pb-5 px-5 mt-5"></VcPagination>
        </div>
      </template>
    </VcTable>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcButton, VcPopup, VcPagination, VcTable, ITableColumn } from "@/components";
import { MemberAddressType } from "@/core/api/graphql/types";
import { computed, watchEffect, PropType, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { isEqualAddresses } from "@core/utilities";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  currentAddress: {
    type: Object as PropType<MemberAddressType>,
    default: undefined,
  },

  addresses: {
    type: Array as PropType<MemberAddressType[]>,
    default: () => [],
  },

  onResult: {
    type: Function,
    default: undefined,
  },
});

defineEmits(["result", "addNewAddress"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const selectedAddress = ref<MemberAddressType>();
const page = ref(1);
const itemsPerPage = ref(4);

const pages = computed(() => Math.ceil(props.addresses.length / itemsPerPage.value));
const paginatedAddresses = computed(() =>
  props.addresses.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const columns = ref<ITableColumn[]>([
  {
    id: "firstName",
    title: t("shared.checkout.select_address_dialog.table_columns.recipient"),
  },
  {
    id: "countryCode",
    title: t("shared.checkout.select_address_dialog.table_columns.address"),
  },
  {
    id: "phone",
    title: t("shared.checkout.select_address_dialog.table_columns.phone"),
  },
  {
    id: "email",
    title: t("shared.checkout.select_address_dialog.table_columns.email"),
  },
  {
    id: "activeAddress",
    title: t("shared.checkout.select_address_dialog.table_columns.active_address"),
    titlePosition: "text-center",
  },
]);

const onPageChange = async (newPage: number) => {
  page.value = newPage;
};

function setAddress(address: MemberAddressType): void {
  selectedAddress.value = address;
}

watchEffect(() => {
  selectedAddress.value = props.addresses.find((item) => isEqualAddresses(item, props.currentAddress!));
});
</script>
