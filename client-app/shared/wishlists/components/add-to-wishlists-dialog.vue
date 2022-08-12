<template>
  <VcPopup :title="$t('shared.wishlists.add_to_wishlists_dialog.title')" modal-width="sm:max-w-xl" is-mobile-fullscreen>
    <div class="flex-grow sm:max-h-screen-60 lg:max-h-screen-75 sm:overflow-y-auto sm:border-b">
      <!-- Lists -->
      <template v-if="!loadingLists">
        <template v-if="listsContain.length">
          <div
            class="py-3 px-6 font-bold text-15 leading-5 bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)] sm:py-2.5"
          >
            {{ $t("shared.wishlists.add_to_wishlists_dialog.already_in_the_lists") }}
          </div>

          <ul>
            <li v-for="list in listsContain" :key="list.id" class="px-6 py-4 sm:pt-4 sm:pb-3 last:sm:pb-7">
              <VcCheckbox
                model-value
                :value="list.id"
                :disabled="loading"
                @update:modelValue="listsRemoveUpdate(list.id || '', $event)"
              >
                <span class="text-base line-clamp-1 font-medium sm:text-15">
                  {{ list.name }}
                </span>
              </VcCheckbox>
            </li>
          </ul>
        </template>

        <div class="flex justify-between py-3 px-6 bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)] sm:py-2.5">
          <div class="font-bold text-15">
            {{ $t("shared.wishlists.add_to_wishlists_dialog.add_to_other_lists") }}
          </div>
          <button
            class="flex items-center text-sm font-bold cursor-pointer text-[color:var(--color-link)]"
            :class="{ 'text-gray-400 cursor-not-allowed': creationButtonDisabled }"
            @click="addInput"
            :disabled="creationButtonDisabled"
          >
            <svg
              class="mr-2 w-3.5 h-3.5 text-[color:var(--color-primary)]"
              :class="{ 'text-gray-400': creationButtonDisabled }"
            >
              <use href="/static/images/plus.svg#main" />
            </svg>
            {{ $t("shared.wishlists.add_to_wishlists_dialog.add_new_list") }}
          </button>
        </div>

        <transition-group name="list-input" tag="ul" class="pt-2 sm:pt-0.5">
          <li
            v-for="(input, index) in inputs"
            :key="index"
            class="flex items-start px-6 list-input-item first:pt-3 first:sm:pt-4"
          >
            <button class="relative mt-3" @click="removeInput(index)">
              <VcCheckbox model-value class="relative" />
              <div class="absolute inset-0"></div>
            </button>
            <VcInput
              class="flex-grow ml-2.5 mr-3.5"
              :class="{ 'mb-4.5': !input.errorMessage }"
              v-model="input.listName"
              :is-disabled="loading"
              :maxlength="25"
              is-required
              :error-message="input.errorMessage"
            ></VcInput>
            <button class="mt-3.5" @click="removeInput(index)">
              <svg class="text-[color:var(--color-add-wishlist-dialog-delete-icon)]" width="16" height="16">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </li>
          <li v-for="list in listsOther" :key="list.id" class="px-6 pt-2 pb-5 sm:pt-3 sm:pb-4 last:pb-5">
            <VcCheckbox v-model="selectedListsOtherIds" :value="list.id" :disabled="loading">
              <span
                class="text-base line-clamp-1 font-medium"
                :class="{ 'text-gray-500': !selectedListsOtherIds.includes(list.id!) }"
              >
                {{ list.name }}
              </span>
            </VcCheckbox>
          </li>
        </transition-group>
      </template>

      <!-- Skeletons -->
      <ul v-if="loadingLists">
        <li v-for="item in lists.length || 3" :key="item" class="flex px-6 py-4 h-14 even:bg-gray-50">
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
          :is-disabled="!inputs.length && !selectedListsOtherIds.length && !listsRemove.length"
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
import { computed, PropType, ref, inject, toRef } from "vue";
import { Product as ProductType } from "@/xapi/types";
import { useWishlists } from "@/shared/wishlists";
import { WishlistInputType } from "@/shared/wishlists/types";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import moment from "moment";
import { useI18n } from "vue-i18n";
import { DEFAULT_WISHLIST_LIMIT, DEFAULT_NOTIFICATION_DURATION, configInjectionKey } from "@/core/constants";

const props = defineProps({
  product: {
    type: Object as PropType<ProductType>,
    required: true,
  },
});

const { t } = useI18n();
const { closePopup } = usePopup();
const {
  loading: loadingLists,
  lists,
  fetchWishlists,
  addItemsToWishlists,
  createWishlistAndAddProduct,
  removeItemsFromWishlists,
} = useWishlists();
const notifications = useNotifications();

const loading = ref(false);
const selectedListsOtherIds = ref<string[]>([]);
const listsRemove = ref<string[]>([]);
const inputs = ref<WishlistInputType[]>([]);

const product = toRef(props, "product");
const config = inject(configInjectionKey);
const listsLimit = config?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

const creationButtonDisabled = computed(() => lists.value.length + inputs.value.length >= listsLimit);

const listsContain = computed(() => {
  return lists.value.filter((list) => list.items!.some((item) => item.productId === product.value.id));
});

function listsRemoveUpdate(id: string, checked: boolean) {
  const index = listsRemove.value.indexOf(id);

  if (!checked && index === -1) {
    listsRemove.value.push(id);
  } else {
    listsRemove.value.splice(index, 1);
  }
}

const listsOther = computed(() => {
  return lists.value.filter((list) => !list.items!.some((item) => item.productId === product.value.id));
});

function addInput() {
  inputs.value.push({
    listName: `${t("shared.wishlists.add_to_wishlists_dialog.new_list")} ${moment().format("YYYY-MM-DD • hh:mm")}`,
    errorMessage: "",
  });
}

function removeInput(index: number) {
  inputs.value.splice(index, 1);
}

async function addToWishlistsFromListOther() {
  if (!selectedListsOtherIds.value.length) {
    return;
  }

  await addItemsToWishlists(selectedListsOtherIds.value.map((listId) => ({ listId, productId: product.value.id })));
}

async function createListsAndAddProduct() {
  if (!inputs.value.length) {
    return;
  }

  inputs.value.forEach(async (input) => {
    await createWishlistAndAddProduct(input.listName, product.value.id);
  });

  inputs.value.splice(0);
}

async function removeProductFromWishlists() {
  const payload = listsRemove.value.map((listId) => {
    const list = listsContain.value.find((item) => item.id === listId);
    const lineItemId = list?.items?.find((item) => item.productId === product.value.id)?.id || "";
    return {
      listId,
      lineItemId,
    };
  });

  if (payload.length) {
    await removeItemsFromWishlists(payload);
  }
}

async function save() {
  inputs.value.forEach((input) => {
    if (!input.listName.trim().length) {
      input.errorMessage = t("shared.wishlists.add_to_wishlists_dialog.is_required_validation_error");
    } else {
      input.errorMessage = "";
    }
  });
  if (inputs.value.filter((input) => !!input.errorMessage?.length).length) {
    return;
  }

  loading.value = true;

  await createListsAndAddProduct();
  await removeProductFromWishlists();
  await addToWishlistsFromListOther();

  closePopup();
  loading.value = false;

  notifications.success({
    duration: DEFAULT_NOTIFICATION_DURATION,
    singleInGroup: true,
    html: t("shared.wishlists.add_to_wishlists_dialog.notification_success"),
  });
}

fetchWishlists();
</script>

<style lang="scss">
.list-input-item {
  transition: all 0.2s ease-in-out;
}

.list-input-enter-from,
.list-input-leave-to {
  opacity: 0;
}
</style>
