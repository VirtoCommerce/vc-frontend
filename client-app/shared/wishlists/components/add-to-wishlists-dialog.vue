<template>
  <VcPopup :title="$t('shared.wishlists.add_to_wishlists_dialog.title')" modal-width="sm:max-w-xl" is-mobile-fullscreen>
    <div class="flex-grow sm:max-h-screen-60 lg:max-h-screen-75 sm:overflow-y-auto sm:border-b">
      <!-- Lists -->
      <template v-if="!loadingLists">
        <template v-if="listsContain.length">
          <div class="py-2.5 px-6 font-bold text-15 leading-5 bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)]">
            {{ $t("shared.wishlists.add_to_wishlists_dialog.already_in_the_lists") }}
          </div>

          <ul>
            <li v-for="list in listsContain" :key="list.id" class="">
              <VcCheckbox
                v-model="list.checked"
                :value="list.id"
                :disabled="loading"
                class="px-6 py-4 sm:py-3.5 last:sm:pb-6"
              >
                <span class="text-base line-clamp-1 font-medium sm:text-15">
                  {{ list.name }}
                </span>
              </VcCheckbox>
            </li>
          </ul>
        </template>

        <div
          class="flex justify-between py-2.5 px-6 bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)] sm:py-2"
        >
          <div class="font-bold text-15">
            {{ $t("shared.wishlists.add_to_wishlists_dialog.add_to_other_lists") }}
          </div>
          <div class="flex items-center text-sm font-bold cursor-pointer text-[color:var(--color-link)]" @click="addInput">
            <svg class="mr-2 w-3.5 h-3.5 text-[color:var(--color-primary)]">
              <use href="/static/images/plus.svg#main" />
            </svg>
            {{ $t("shared.wishlists.add_to_wishlists_dialog.add_new_list") }}
          </div>
        </div>

        <ul>
          <li v-for="(input, index) in inputs" class="flex items-start px-6 pt-2 first:pt-5">
            <VcCheckbox class="pt-3" model-value @click="removeInput(index)" />
            <VcInput
              class="flex-grow ml-2.5 mr-3.5"
              :class="{ 'mb-3': !input.errorMessage }"
              v-model="input.listName"
              :is-disabled="loading"
              is-required
              :error-message="input.errorMessage"
            ></VcInput>
            <button class="pt-3.5" @click="removeInput(index)">
              <svg class="text-[color:var(--color-add-wishlist-dialog-delete-icon)]" width="16" height="16">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </li>
          <li v-for="list in listsOther" :key="list.id" class="px-6 py-4 sm:py-3.5 last:sm:pb-5">
            <VcCheckbox v-model="selectedListsOtherIds" :value="list.id" :disabled="loading">
              <span
                class="text-base line-clamp-1 font-medium"
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
      <div v-else-if="!listsOther.length && !listsContain.length" class="bg-gray-50 text-center px-6 py-10">
        {{ $t("shared.wishlists.add_to_wishlists_dialog.empty_list") }}
      </div>
    </div>

    <template #actions="{ close }">
      <div class="flex-grow flex items-center justify-between -mx-6 px-6 pb-3 space-x-5 sm:pb-0 sm:space-x-auto">
        <VcButton
          kind="secondary"
          class="uppercase basis-0 flex-grow sm:basis-auto sm:flex-grow-0 sm:px-4"
          is-outline
          @click="close"
        >
          {{ $t("shared.wishlists.add_to_wishlists_dialog.cancel_button") }}
        </VcButton>

        <VcButton
          :is-waiting="loading"
          class="uppercase basis-0 flex-grow sm:basis-auto sm:flex-grow-0 sm:px-5 sm:min-w-[9rem]"
          @click="save"
        >
          {{ $t("shared.wishlists.add_to_wishlists_dialog.save_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import { Product as ProductType } from "@/xapi/types";
import { AddedToWishlistsDialog, useWishlists } from "@/shared/wishlists";
import { InputRemoveWishlistItemType } from "@/xapi/types";
import { SelectedWishlistType, WishlistInputType } from "@/shared/wishlists/types";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import moment from "moment";

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
} = useWishlists({ autoRefetch: false });
const notifications = useNotifications();

const loading = ref(false);
const selectedListsOtherIds = ref<string[]>([]);
const selectedListsContainIds = ref<string[]>([]);
const inputs = ref<WishlistInputType[]>([]);

const productId = props.product.id;

const listsContain = computed(() => {
  return lists.value
    .filter((list) => list.items!.some((item) => item.productId === productId))
    .map((list: SelectedWishlistType) => {
      list.checked = true;
      return list;
    });
});

const listsOther = computed(() => {
  return lists.value.filter((list) => !list.items!.some((item) => item.productId === productId));
});

function addInput() {
  inputs.value.push({
    listName: `New list ${moment().format("YYYY-MM-DD • hh:mm")}`,
    errorMessage: "Error hjdkaslh dahjkdsa very long long long",
  });
}

function removeInput(index: number) {
  inputs.value.splice(index, 1);
}

function validateInput(index: number) {
  if (!inputs.value[index].listName.trim().length) {
    inputs.value[index].errorMessage = "This field is required!";
  }
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
    await createWishlistAndAddProduct(input.listName, productId);
  });

  inputs.value.splice(0);
}

async function removeProductFromWishlists() {
  const payload = listsContain.value
    .filter((list) => !list.checked)
    .map((list) => {
      const lineItemId = list.items?.find((item) => item.productId === productId)?.id || "";
      return {
        listId: list.id || "",
        lineItemId,
      };
    });

  if (payload.length) {
    await removeItemsFromWishlists(payload);
  }
}

async function save() {
  loading.value = true;

  await removeProductFromWishlists();
  await createListsAndAddProduct();
  await addToWishlistsFromListOther();

  closePopup();
  loading.value = false;

  notifications.success({
    duration: 15000,
    singleInGroup: true,
    html: `Success`,
  });
}

fetchWishlists();
</script>
