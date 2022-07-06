<template>
  <VcPopup :title="$t('shared.wishlists.add_to_wishlists_dialog.title')" modal-width="max-w-xl">
    <div class="max-h-[50vh] lg:max-h-64 overflow-y-auto border-b">
      <!-- Lists -->
      <template v-if="!loadingLists">
        <template v-if="listsContain.length">
          <div class="font-bold">Already in the lists</div>

          <ul>
            <li v-for="list in listsContain" :key="list.id" class="even:bg-gray-50">
              <VcCheckbox v-model="list.checked" :value="list.id" :disabled="loading" class="px-6 py-4">
                <span
                  class="text-base line-clamp-1"
                  :class="{ 'text-gray-500': !selectedListsContainIds.includes(list.id!) }"
                >
                  {{ list.name }}
                </span>
              </VcCheckbox>
            </li>
          </ul>
        </template>

        <div class="flex justify-between font-bold">
          <div>Add to other lists</div>
          <div @click="addInput">Add new list</div>
        </div>

        <ul>
          <li v-for="(input, index) in inputs">
            <input type="" v-model="input.listName" />
            <button @click="removeInput(index)">remove</button>
          </li>
          <li v-for="list in listsOther" :key="list.id" class="even:bg-gray-50">
            <VcCheckbox v-model="selectedListsOtherIds" :value="list.id" :disabled="loading" class="px-6 py-4">
              <span
                class="text-base line-clamp-1"
                :class="{ 'text-gray-500': !selectedListsOtherIds.includes(list.id!) }"
              >
                {{ list.name }}
              </span>
            </VcCheckbox>
          </li>
        </ul>
      </template>

      <!-- Skeletons -->
      <ul v-if="loadingLists">
        <li v-for="item in listsOther.length || 3" :key="item" class="flex px-6 py-4 h-14 even:bg-gray-50">
          <div class="w-full bg-gray-100"></div>
        </li>
      </ul>

      <!-- Empty -->
      <p v-else-if="!listsOther.length && !listsContain.length" class="bg-gray-50 text-center px-6 py-10">
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

      <VcButton :is-waiting="loading" class="uppercase flex-grow lg:flex-grow-0 inline-flex lg:px-5" @click="save">
        {{ $t("shared.wishlists.add_to_wishlists_dialog.add_to_list_button") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { Product as ProductType } from "@/xapi/types";
import { AddedToWishlistsDialog, useWishlists } from "@/shared/wishlists";
import { InputRemoveWishlistItemType } from "@/xapi/types";
import { SelectedWishlistType, WishlistInputType } from "@/shared/wishlists/types";
import { usePopup } from "@/shared/popup";

const props = defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});

const { openPopup, closePopup } = usePopup();
const {
  loading: loadingLists,
  lists,
  fetchWishlists,
  addItemsToWishlists,
  createWishlistAndAddProduct,
  removeItemsFromWishlists,
} = useWishlists();

const loading = ref(false);
const selectedListsOtherIds = ref<string[]>([]);
const selectedListsContainIds = ref<string[]>([]);
const inputs = ref<WishlistInputType[]>([]);

const productId = props.product.id;

const listsContain = computed(() => {
  return lists.value
    .filter((list) => list.items!.some((item) => item.productId === productId))
    .map((list: SelectedWishlistType) => {
      list["checked"] = true;
      return list;
    });
});

const listsOther = computed(() => {
  return lists.value.filter((list) => !list.items!.some((item) => item.productId === productId));
});

function addInput() {
  inputs.value.push({ listName: "" });
}

function removeInput(index: number) {
  inputs.value.splice(index, 1);
}

async function addToWishlistsFromListOther() {
  if (!selectedListsOtherIds.value.length) {
    return;
  }

  await addItemsToWishlists(selectedListsOtherIds.value.map((listId) => ({ listId, productId })));
}

async function createListsAndAddProduct() {
  if (!inputs.value.length) {
    return;
  }

  inputs.value.forEach(async (input) => {
    if (input.listName.length) {
      await createWishlistAndAddProduct(input.listName, productId);
    }
  });

  inputs.value.splice(0);
}

async function removeProductFromWishlists() {
  const payload: InputRemoveWishlistItemType[] = [];

  listsContain.value.forEach((list) => {
    if (!list.checked) {
      const lineItemId = list.items?.find((item) => item.productId === productId)?.id || '';
      payload.push({
        listId: list.id || '',
        lineItemId,
      });
    }
  });

  if (payload.length) {
    await removeItemsFromWishlists(payload);
  }
}

async function save() {
  loading.value = true;

  await createListsAndAddProduct();
  await removeProductFromWishlists();
  await addToWishlistsFromListOther();

  closePopup();
  loading.value = false;

  openPopup({
    component: AddedToWishlistsDialog,
    props: {
      product: props.product,
      listIds: selectedListsOtherIds.value,
    },
  });
}

fetchWishlists();
</script>
