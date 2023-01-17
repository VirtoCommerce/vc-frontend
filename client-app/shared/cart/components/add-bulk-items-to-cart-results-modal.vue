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
            <div class="flex grow min-w-0 items-center gap-x-2.5">
              <span
                :class="[
                  'flex shrink-0 items-center justify-center h-6 w-6 rounded-full text-white',
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

              <span
                class="text-15 font-bold truncate"
                v-t="'shared.cart.add_bulk_items_to_cart_results_popup.groups.' + group.name"
              />

              <span
                class="px-2 py-0.5 text-11 leading-3 font-extrabold rounded-full border border-[color:var(--color-primary)]"
              >
                {{ group.items.length }}
              </span>
            </div>
          </template>

          <div class="overflow-y-auto max-h-80 md:max-h-72 rounded-[inherit]">
            <ul class="md:table w-full">
              <li class="hidden md:table-row md:sticky top-0 text-15 font-extrabold bg-gray-50">
                <div
                  class="table-cell px-4 py-2.5 border-b"
                  v-t="'shared.cart.add_bulk_items_to_cart_results_popup.labels.sku'"
                />

                <div
                  class="table-cell px-4 py-2.5 border-b"
                  v-t="'shared.cart.add_bulk_items_to_cart_results_popup.labels.product_name'"
                />

                <div
                  class="table-cell px-4 py-2.5 border-b text-right"
                  v-t="'shared.cart.add_bulk_items_to_cart_results_popup.labels.quantity'"
                />
              </li>

              <li
                v-for="item in group.items"
                :key="item.sku"
                class="flex flex-wrap px-4 py-2.5 md:p-0 border-b last:border-0 md:border-0 md:table-row md:odd:bg-gray-50"
              >
                <div class="flex flex-col w-3/5 md:w-auto pr-3 md:table-cell md:px-4 md:py-2.5 md:align-middle">
                  <span
                    class="text-13 text-gray-400 md:hidden"
                    v-t="'shared.cart.add_bulk_items_to_cart_results_popup.labels.sku'"
                  />
                  <span class="font-semibold">{{ item.sku }}</span>
                </div>

                <div
                  class="shrink-0 w-full md:w-auto order-first mb-2.5 md:mb-0 line-clamp-2 md:line-clamp-none md:table-cell md:px-4 md:py-2.5 md:align-middle"
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
                  class="flex flex-col w-2/5 md:w-auto md:table-cell md:px-4 md:py-2.5 md:align-middle md:text-right"
                >
                  <span
                    class="text-13 text-gray-400 md:hidden"
                    v-t="'shared.cart.add_bulk_items_to_cart_results_popup.labels.quantity'"
                  />
                  <span class="font-bold">{{ $n(item.quantity) }}</span>
                </div>
              </li>
            </ul>
          </div>
        </VcExpansionPanel>
      </VcExpansionPanels>
    </div>

    <template #actions="{ close }">
      <VcButton
        class="uppercase w-full sm:w-36"
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
import { computed, PropType } from "vue";
import { useProductsRoutes } from "@/core";
import { ItemForAddBulkItemsToCartResultsPopup } from "@/shared/cart";

type Group = { name: "added" | "not_added"; items: ItemForAddBulkItemsToCartResultsPopup[] };

const props = defineProps({
  items: {
    type: Array as PropType<ItemForAddBulkItemsToCartResultsPopup[]>,
    default: () => [],
    required: true,
  },
});

const links = useProductsRoutes(props.items, { productIdProperty: "productId" });

const groups = computed<Group[]>(() => {
  const result: Group[] = [];
  const added: ItemForAddBulkItemsToCartResultsPopup[] = [];
  const notAdded: ItemForAddBulkItemsToCartResultsPopup[] = [];

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
