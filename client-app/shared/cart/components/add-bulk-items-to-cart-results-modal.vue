<template>
  <VcPopup
    :title="$t('shared.cart.add_bulk_items_to_cart_results_popup.title')"
    modal-width="sm:max-w-3xl"
    is-mobile-fullscreen
  >
    <div class="flex-1 gap-y-5 p-6 md:border-b">
      <VcExpansionPanels class="flex flex-col gap-y-4">
        <VcExpansionPanel
          v-for="(group, index) in groups"
          :key="group.name"
          :expanded="!index && groups.length === 1"
          header-classes="px-4 py-5"
          full-width-content
        >
          <template #header-content>
            <div class="flex min-w-0 grow items-center gap-x-2.5">
              <span
                :class="[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white',
                  {
                    'bg-[color:var(--color-success)]': group.name === 'added',
                    'bg-[color:var(--color-danger)]': group.name === 'not_added',
                  },
                ]"
              >
                <i
                  :class="[
                    'fas',
                    {
                      'fa-check': group.name === 'added',
                      'fa-times': group.name === 'not_added',
                    },
                  ]"
                />
              </span>

              <span class="truncate text-15 font-bold">
                {{ $t(`shared.cart.add_bulk_items_to_cart_results_popup.groups.${group.name}`) }}
              </span>

              <span
                class="rounded-full border border-[color:var(--color-primary)] px-2 py-0.5 text-11 font-extrabold leading-3"
              >
                {{ group.items.length }}
              </span>
            </div>
          </template>

          <div class="max-h-80 overflow-y-auto rounded-[inherit] md:max-h-72">
            <ul class="w-full md:table">
              <li class="top-0 hidden bg-gray-50 text-15 font-extrabold md:sticky md:table-row">
                <div class="table-cell border-b px-4 py-2.5">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_popup.labels.sku") }}
                </div>

                <div class="table-cell border-b px-4 py-2.5">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_popup.labels.product_name") }}
                </div>

                <div class="table-cell border-b px-4 py-2.5 text-right">
                  {{ $t("shared.cart.add_bulk_items_to_cart_results_popup.labels.quantity") }}
                </div>
              </li>

              <li
                v-for="item in group.items"
                :key="item.sku"
                class="flex flex-wrap border-b px-4 py-2.5 last:border-0 md:table-row md:border-0 md:p-0 md:odd:bg-gray-50"
              >
                <div class="flex w-3/5 flex-col pr-3 md:table-cell md:w-auto md:px-4 md:py-2.5 md:align-middle">
                  <span class="text-13 text-gray-400 md:hidden">
                    {{ $t("shared.cart.add_bulk_items_to_cart_results_popup.labels.sku") }}
                  </span>
                  <span class="font-semibold">{{ item.sku }}</span>
                </div>

                <div
                  class="order-first mb-2.5 line-clamp-2 w-full shrink-0 md:mb-0 md:line-clamp-none md:table-cell md:w-auto md:px-4 md:py-2.5 md:align-middle"
                >
                  <router-link
                    :to="links[item.productId]"
                    target="_blank"
                    class="font-semibold text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
                  >
                    {{ item.name }}
                  </router-link>
                </div>

                <div
                  class="flex w-2/5 flex-col md:table-cell md:w-auto md:px-4 md:py-2.5 md:text-right md:align-middle"
                >
                  <span class="text-13 text-gray-400 md:hidden">
                    {{ $t("shared.cart.add_bulk_items_to_cart_results_popup.labels.quantity") }}
                  </span>
                  <span class="font-bold">{{ $n(item.quantity) }}</span>
                </div>
              </li>
            </ul>
          </div>
        </VcExpansionPanel>
      </VcExpansionPanels>
    </div>

    <template #actions="{ close }">
      <VcButton :route="{ name: 'Cart' }" class="w-full sm:w-36" @click="close()">
        {{ $t("common.buttons.view_cart") }}
      </VcButton>

      <VcButton
        class="w-full sm:w-36"
        @click="
          close();
          $emit('confirm');
        "
      >
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useProductsRoutes } from "@/core/composables";
import { VcButton } from "@/ui-kit/components";
import type { ItemForAddBulkItemsToCartResultsPopupType } from "@/shared/cart";

type GroupType = { name: "added" | "not_added"; items: ItemForAddBulkItemsToCartResultsPopupType[] };

interface IEmits {
  (event: "confirm"): void;
}

interface IProps {
  items?: ItemForAddBulkItemsToCartResultsPopupType[];
}

defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  items: () => [],
});

const links = useProductsRoutes(props.items, { productIdProperty: "productId" });

const groups = computed<GroupType[]>(() => {
  const result: GroupType[] = [];
  const added: ItemForAddBulkItemsToCartResultsPopupType[] = [];
  const notAdded: ItemForAddBulkItemsToCartResultsPopupType[] = [];

  props.items.forEach((item) => {
    if (item.errors?.length) {
      notAdded.push(item);
    } else {
      added.push(item);
    }
  });

  if (added.length) {
    result.push({ name: "added", items: added });
  }

  if (notAdded.length) {
    result.push({ name: "not_added", items: notAdded });
  }

  return result;
});
</script>
