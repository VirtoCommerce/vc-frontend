<template>
  <VcPopup :title="$t('shared.wishlists.add_to_wishlists_dialog.title')" modal-width="sm:max-w-xl" is-mobile-fullscreen>
    <div class="grow sm:max-h-screen-60 sm:overflow-y-auto sm:border-b lg:max-h-screen-75">
      <!-- Lists -->
      <template v-if="!loadingLists">
        <template v-if="listsContain.length">
          <div
            class="bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)] py-3 px-6 text-15 font-bold leading-5 sm:py-2.5"
          >
            {{ $t("shared.wishlists.add_to_wishlists_dialog.already_in_the_lists") }}
          </div>

          <ul>
            <li v-for="list in listsContain" :key="list.id" class="px-6 py-4 sm:pt-4 sm:pb-3 last:sm:pb-7">
              <VcCheckbox
                model-value
                :value="list.id"
                :disabled="loading"
                @update:model-value="listsRemoveUpdate(list.id || '', $event)"
              >
                <span class="text-base font-medium line-clamp-1 sm:text-15">
                  {{ list.name }}
                </span>
              </VcCheckbox>
            </li>
          </ul>
        </template>

        <div class="flex justify-between bg-[color:var(--color-add-wishlist-dialog-subtitle-bg)] py-3 px-6 sm:py-2.5">
          <div class="text-15 font-bold">
            {{ $t("shared.wishlists.add_to_wishlists_dialog.add_to_other_lists") }}
          </div>
          <button
            type="button"
            class="flex cursor-pointer items-center text-sm font-bold text-[color:var(--color-link)]"
            :class="{ 'cursor-not-allowed text-gray-400': creationButtonDisabled }"
            :disabled="creationButtonDisabled"
            @click="addInput"
          >
            <svg
              class="mr-2 h-3.5 w-3.5 text-[color:var(--color-primary)]"
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
            class="list-input-item flex items-start px-6 first:pt-3 first:sm:pt-4"
          >
            <button type="button" class="relative mt-3" @click="removeInput(index)">
              <VcCheckbox model-value class="relative" />
              <div class="absolute inset-0"></div>
            </button>
            <VcInput
              v-model="input.listName"
              class="ml-2.5 mr-3.5 grow"
              :class="{ 'mb-4.5': !input.errorMessage }"
              :disabled="loading"
              :maxlength="25"
              required
              :message="input.errorMessage"
              :error="!!input.errorMessage"
            />
            <button type="button" class="mt-3.5" @click="removeInput(index)">
              <svg class="text-[color:var(--color-add-wishlist-dialog-delete-icon)]" width="16" height="16">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </li>
          <li v-for="list in listsOther" :key="list.id" class="px-6 pt-2 pb-5 last:pb-5 sm:pt-3 sm:pb-4">
            <VcCheckbox v-model="selectedListsOtherIds" :value="list.id" :disabled="loading">
              <span
                class="text-base font-medium line-clamp-1"
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
        <li v-for="item in lists.length || 3" :key="item" class="flex h-14 px-6 py-4 even:bg-gray-50">
          <div class="w-full bg-gray-100"></div>
        </li>
      </ul>

      <!-- Empty -->
      <div v-else-if="!listsOther.length && !listsContain.length" class="bg-gray-50 px-6 py-10 text-center">
        {{ $t("shared.wishlists.add_to_wishlists_dialog.empty_list") }}
      </div>
    </div>

    <template #actions="{ close }">
      <div class="sm:space-x-auto -mx-6 flex grow items-center justify-between space-x-5 px-6 pb-3 sm:pb-0">
        <VcButton
          kind="secondary"
          class="grow basis-0 uppercase sm:grow-0 sm:basis-auto sm:px-4"
          is-outline
          @click="close"
        >
          {{ $t("shared.wishlists.add_to_wishlists_dialog.cancel_button") }}
        </VcButton>

        <VcButton
          :is-waiting="loading"
          :is-disabled="!inputs.length && !selectedListsOtherIds.length && !listsRemove.length"
          class="grow basis-0 uppercase sm:min-w-[9rem] sm:grow-0 sm:basis-auto sm:px-5"
          @click="save"
        >
          {{ $t("shared.wishlists.add_to_wishlists_dialog.save_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import moment from "moment";
import { computed, PropType, ref, inject, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT, DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { configInjectionKey } from "@/core/injection-keys";
import { asyncForEach } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import { usePopup } from "@/shared/popup";
import { useWishlists } from "@/shared/wishlists";
import { WishlistInputType } from "@/shared/wishlists/types";
import { Product as ProductType } from "@/xapi/types";

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
const ga = useGoogleAnalytics();

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

  /**
   * Send Google Analytics event for an item added to wish list.
   */
  ga.addItemToWishList(product.value);
}

async function createListsAndAddProduct() {
  if (!inputs.value.length) {
    return;
  }

  await asyncForEach(inputs.value, async (input) => {
    await createWishlistAndAddProduct(input.listName, product.value.id);
  });

  inputs.value = [];

  /**
   * Send Google Analytics event for an item added to wish list.
   */
  ga.addItemToWishList(product.value);
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
