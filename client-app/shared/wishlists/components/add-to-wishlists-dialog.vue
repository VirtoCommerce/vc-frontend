<template>
  <VcPopup :title="$t('shared.wishlists.add_to_wishlists_dialog.title')" modal-width="max-w-xl">
    <div class="max-h-[50vh] lg:max-h-64 overflow-y-auto border-b">
      <!-- Lists -->
      <ul v-if="extendedLists.length">
        <li v-for="list in extendedLists" :key="list.id" class="even:bg-gray-50">
          <div v-if="list.contains" class="flex px-6 py-4 select-none cursor-not-allowed">
            <VcCheckbox class="!inline-flex mr-2" :model-value="true" disabled />

            <div class="inline-flex flex-grow space-x-3 items-center justify-between text-base">
              <span class="line-clamp-1">{{ list.name }}</span>

              <small class="flex flex-shrink-0 items-center leading-tight">
                <i class="fas fa-check text-base text-[color:var(--color-primary)] mr-1.5" />
                {{ $t("shared.wishlists.add_to_wishlists_dialog.item_already_in_list") }}
              </small>
            </div>
          </div>

          <VcCheckbox v-else v-model="selectedListsIds" :value="list.id" :disabled="loading" class="px-6 py-4">
            <span class="text-base line-clamp-1" :class="{ 'text-gray-500': !selectedListsIds.includes(list.id!) }">
              {{ list.name }}
            </span>
          </VcCheckbox>
        </li>
      </ul>

      <!-- Skeletons -->
      <ul v-else-if="loadingLists">
        <li v-for="item in extendedLists.length || 3" :key="item" class="px-6 py-4 even:bg-gray-50">
          <p class="w-full bg-gray-100">&nbsp;</p>
        </li>
      </ul>

      <!-- Empty -->
      <p v-else class="bg-gray-50 text-center px-6 py-10">
        {{ $t("shared.wishlists.add_to_wishlists_dialog.empty_list") }}
      </p>
    </div>

    <template #actions="{ close }">
      <VcButton
        kind="secondary"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5"
        is-outline
        @click="close"
      >
        {{ $t("shared.wishlists.add_to_wishlists_dialog.cancel_button") }}
      </VcButton>

      <VcButton
        :is-waiting="loading"
        :is-disabled="!selectedListsIds.length"
        class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5"
        @click="addToWishlists"
      >
        {{ $t("shared.wishlists.add_to_wishlists_dialog.add_to_list_button") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { VcButton, VcCheckbox, VcPopup } from "@/components";
import { Product as ProductType } from "@/core/api/graphql/types";
import { AddedToWishlistsDialog, useWishlists } from "@/shared/wishlists";
import { usePopup } from "@/shared/popup";

const props = defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});

const { openPopup, closePopup } = usePopup();
const { loading: loadingLists, lists, fetchWishlists, addItemsToWishlists } = useWishlists();

const loading = ref(false);
const selectedListsIds = ref<string[]>([]);

const extendedLists = computed(() => {
  const productId = props.product.id;

  return lists.value.map((list) => ({
    ...list,
    contains: list.items!.some((item) => item.productId === productId),
  }));
});

async function addToWishlists() {
  if (!selectedListsIds.value.length) return;

  const productId = props.product.id;

  loading.value = true;

  await addItemsToWishlists(selectedListsIds.value.map((listId) => ({ listId, productId })));

  closePopup();

  loading.value = false;

  openPopup({
    component: AddedToWishlistsDialog,
    props: {
      product: props.product,
      listIds: selectedListsIds.value,
    },
  });
}

fetchWishlists();
</script>
