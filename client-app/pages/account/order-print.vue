<template>
  <div class="mt-6 grow space-y-4">
    <h2 class="text-xl font-bold uppercase">
      {{ $t("pages.account.order_details.title", [order?.number]) }}
    </h2>

    <template v-if="$config.line_items_group_by_vendor_enabled">
      <div v-for="(group, groupIndex) in orderItemsGroupedByVendor" :key="groupIndex" class="space-y-6">
        <div class="space-y-3">
          <div class="vc-vendor">
            <svg class="vc-icon vc-icon--size--sm vc-vendor__icon">
              <use href="/static/icons/basic/vendor.svg#icon" />
            </svg>

            <span class="vc-vendor__title">
              {{ $t("common.labels.vendor") }}:

              <span :class="group.vendor?.name || 'text-gray-400'">
                {{ group.vendor?.name || $t("common.labels.not_available") }}
              </span>
            </span>
          </div>

          <div class="overflow-hidden rounded border border-[--color-neutral-100]">
            <table class="w-full border-collapse text-xs">
              <thead class="bg-[--color-neutral-50] text-left font-bold">
                <th class="w-1/2 px-2.5 py-2">
                  {{ $t("common.labels.product_name") }}
                </th>
                <th class="w-1/6 px-2.5 py-2">
                  {{ $t("common.labels.sku") }}
                </th>
                <th class="w-1/6 px-2.5 py-2">
                  {{ $t("common.labels.price_per_item") }}
                </th>
                <th class="w-1/6 px-2.5 py-2">
                  {{ $t("common.labels.quantity") }}
                </th>
                <th class="w-2/6 px-2.5 py-2">
                  {{ $t("common.labels.total") }}
                </th>
              </thead>

              <tbody>
                <tr v-for="(item, itemIndex) in group.items" :key="itemIndex" class="even:bg-[--color-neutral-50]">
                  <td class="px-2.5 py-2">{{ item.name }}</td>
                  <td class="px-2.5 py-2">{{ item.sku }}</td>
                  <td class="px-2.5 py-2">{{ item.placedPrice?.formattedAmount }}</td>
                  <td class="px-2.5 py-2">{{ item.quantity }}</td>
                  <td class="px-2.5 py-2">{{ item.extendedPrice?.formattedAmount }}</td>
                </tr>
                <tr class="border-t border-[--color-neutral-100] bg-[--color-additional-50]">
                  <td class="px-2.5 py-2 font-bold">{{ $t("common.labels.subtotal") }}</td>
                  <td class="px-2.5 py-2"></td>
                  <td class="px-2.5 py-2"></td>
                  <td class="px-2.5 py-2"></td>
                  <td class="px-2.5 py-2 font-bold">
                    {{
                      $n(
                        sumBy(group.items, (item) => item.extendedPrice?.amount),
                        "currency",
                      )
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="overflow-hidden rounded border border-[--color-neutral-100]">
        <table class="w-full border-collapse text-xs">
          <thead class="bg-[--color-neutral-50] text-left font-bold">
            <th class="w-1/2 px-2.5 py-2">{{ $t("common.labels.product_name") }}</th>
            <th class="w-1/6 px-2.5 py-2">{{ $t("common.labels.sku") }}</th>
            <th class="w-1/6 px-2.5 py-2">{{ $t("common.labels.price_per_item") }}</th>
            <th class="w-1/6 px-2.5 py-2">{{ $t("common.labels.quantity") }}</th>
            <th class="w-2/6 px-2.5 py-2">{{ $t("common.labels.total") }}</th>
          </thead>

          <tbody>
            <tr v-for="(item, itemIndex) in orderItems" :key="itemIndex" class="even:bg-[--color-neutral-50]">
              <td class="px-2.5 py-2">{{ item.name }}</td>
              <td class="px-2.5 py-2">{{ item.sku }}</td>
              <td class="px-2.5 py-2">{{ item.placedPrice?.formattedAmount }}</td>
              <td class="px-2.5 py-2">{{ item.quantity }}</td>
              <td class="px-2.5 py-2">{{ item.extendedPrice?.formattedAmount }}</td>
            </tr>
            <tr class="border-t border-[--color-neutral-100] bg-[--color-additional-50]">
              <td class="px-2.5 py-2 font-bold">{{ $t("common.labels.subtotal") }}</td>
              <td class="px-2.5 py-2"></td>
              <td class="px-2.5 py-2"></td>
              <td class="px-2.5 py-2"></td>
              <td class="px-2.5 py-2 font-bold">
                {{
                  $n(
                    sumBy(orderItems, (item) => item.extendedPrice?.amount),
                    "currency",
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import { watchEffect } from "vue";
import { useUserOrder } from "@/shared/account";

export interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const { order, orderItems, orderItemsGroupedByVendor, clearOrder, fetchOrder } = useUserOrder();

watchEffect(() => {
  clearOrder();
  fetchOrder({ id: props.orderId });
});
</script>
