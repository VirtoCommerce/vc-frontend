<template>
  <VcModal :title="$t('shared.wishlists.add_to_wishlists_modal.title')" max-width="50rem" is-mobile-fullscreen dividers>
    <div class="rounded border">
      <!-- Lists -->
      <template v-if="!loadingProductWishlists && !loadingLists">
        <template v-if="listsWithProduct.length">
          <div class="bg-neutral-100 px-6 py-3 text-base font-bold leading-5 sm:py-2.5">
            {{ $t("shared.wishlists.add_to_wishlists_modal.already_in_the_lists") }}
          </div>

          <ul>
            <li
              v-for="list in listsWithProduct"
              :key="list.id"
              class="flex justify-between px-6 py-4 sm:pb-3 sm:pt-4 last:sm:pb-7"
            >
              <VcCheckbox
                model-value
                :value="list.id"
                :disabled="loading"
                @update:model-value="listsRemoveUpdate(list.id || '', !!$event)"
              >
                <span class="line-clamp-1 text-base">
                  {{ list.name }}
                </span>
              </VcCheckbox>

              <WishlistStatus v-if="isCorporateMember && list.scope" :scope="list.scope" />
            </li>
          </ul>
        </template>

        <div class="flex justify-between bg-neutral-100 px-6 py-3 sm:py-2.5">
          <div class="text-base font-bold">
            {{ $t("shared.wishlists.add_to_wishlists_modal.add_to_other_lists") }}
          </div>

          <button
            type="button"
            class="flex cursor-pointer items-center text-sm font-bold text-[--link-color] disabled:cursor-not-allowed disabled:text-neutral-400"
            :disabled="creationButtonDisabled"
            @click="addNewList"
          >
            <svg :class="['mr-2 size-3.5', creationButtonDisabled ? 'text-neutral-400' : 'text-primary']">
              <use href="/static/images/plus.svg#main" />
            </svg>

            {{ $t("shared.wishlists.add_to_wishlists_modal.add_new_list") }}
          </button>
        </div>

        <transition-group name="list-input" tag="ul" class="pt-2 sm:pt-0.5">
          <li
            v-for="(input, index) in newLists"
            :key="index"
            class="list-input-item flex items-start px-6 first:pt-3 first:sm:pt-4"
          >
            <button type="button" class="relative mt-3" @click="removeNewList(index)">
              <VcCheckbox model-value class="relative" />
              <div class="absolute inset-0"></div>
            </button>

            <VcInput
              v-model="input.listName"
              class="ml-2.5 mr-3.5 grow"
              :disabled="loading"
              :maxlength="25"
              required
              show-empty-details
              :message="input.errorMessage"
              :error="!!input.errorMessage"
            />

            <button type="button" class="mt-3.5" @click="removeNewList(index)">
              <svg class="text-danger" width="16" height="16">
                <use href="/static/images/delete.svg#main" />
              </svg>
            </button>
          </li>
        </transition-group>

        <VcCheckboxGroup v-model="selectedListsOtherIds">
          <transition-group name="list-input" tag="ul">
            <li
              v-for="list in listsOther"
              :key="list.id"
              class="flex justify-between px-6 pb-5 pt-2 last:pb-5 sm:pb-4 sm:pt-3"
            >
              <VcCheckbox :value="list.id" :disabled="loading">
                <span
                  class="line-clamp-1 text-base"
                  :class="{ 'text-neutral': !selectedListsOtherIds.includes(list.id!) }"
                >
                  {{ list.name }}
                </span>
              </VcCheckbox>

              <WishlistStatus v-if="isCorporateMember && list.scope" :scope="list.scope" />
            </li>
          </transition-group>
        </VcCheckboxGroup>
      </template>

      <!-- Skeletons -->
      <ul v-if="loadingProductWishlists || loadingLists">
        <li v-for="item in lists.length || 3" :key="item" class="flex h-14 px-6 py-4 even:bg-neutral-50">
          <div class="w-full bg-neutral-100"></div>
        </li>
      </ul>

      <!-- Empty -->
      <div
        v-else-if="!listsOther.length && !listsWithProduct.length && !newLists.length"
        class="bg-neutral-50 px-6 py-10 text-center"
      >
        {{ $t("shared.wishlists.add_to_wishlists_modal.empty_list") }}
      </div>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.add_to_wishlists_modal.cancel_button") }}
      </VcButton>

      <VcButton
        :loading="loading"
        :disabled="!newLists.length && !selectedListsOtherIds.length && !removedLists.length"
        class="ms-auto"
        @click="save"
      >
        {{ $t("shared.wishlists.add_to_wishlists_modal.save_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGetProductWishlistsQuery } from "@/core/api/graphql/catalog/queries/getProductWishlists";
import { useGoogleAnalytics } from "@/core/composables";
import { DEFAULT_WISHLIST_LIMIT, DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { configInjectionKey } from "@/core/injection-keys";
import { asyncForEach } from "@/core/utilities";
import { useUser } from "@/shared/account/composables";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { useWishlists } from "../composables";
import type { Product as ProductType } from "@/core/api/graphql/types";
import type { WishlistInputType } from "@/shared/wishlists/types";
import WishlistStatus from "@/shared/wishlists/components/wishlist-status.vue";

interface IProps {
  product: ProductType;
}

interface IEmits {
  (event: "result", isInList: boolean): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const product = toRef(props, "product");

const { d, t } = useI18n();
const { closeModal } = useModal();
const { isCorporateMember } = useUser();

const {
  loading: loadingLists,
  lists,
  fetchWishlists,
  addItemsToWishlists,
  createWishlist,
  removeItemsFromWishlists,
} = useWishlists({ autoRefetch: false });
const notifications = useNotifications();
const ga = useGoogleAnalytics();
const {
  loading: loadingProductWishlists,
  load: fetchProductWishlists,
  refetch: refetchProductWishlists,
  result: productWishlistsResult,
} = useGetProductWishlistsQuery(product.value.id);

const loading = ref(false);
const selectedListsOtherIds = ref<string[]>([]);
const removedLists = ref<string[]>([]);
const newLists = ref<WishlistInputType[]>([]);

const config = inject(configInjectionKey);
const listsLimit = config?.wishlists_limit || DEFAULT_WISHLIST_LIMIT;

const creationButtonDisabled = computed(() => lists.value.length + newLists.value.length >= listsLimit);

const listsWithProduct = computed(() =>
  lists.value.filter((list) => productWishlistsResult.value?.product?.wishlistIds.some((listId) => listId === list.id)),
);

const listsOther = computed(() => {
  return lists.value.filter(
    (list) => !productWishlistsResult.value?.product?.wishlistIds.some((listId) => listId === list.id),
  );
});

function listsRemoveUpdate(id: string, checked: boolean) {
  const index = removedLists.value.indexOf(id);

  if (!checked && index === -1) {
    removedLists.value.push(id);
  } else {
    removedLists.value.splice(index, 1);
  }
}

function addNewList() {
  newLists.value.push({
    listName: `${t("shared.wishlists.add_to_wishlists_modal.new_list")} ${d(new Date())}`,
    errorMessage: "",
  });
}

function removeNewList(index: number) {
  newLists.value.splice(index, 1);
}

async function addToWishlistsFromListOther() {
  if (!selectedListsOtherIds.value.length) {
    return;
  }

  await addItemsToWishlists({
    listIds: selectedListsOtherIds.value,
    productId: product.value.id,
    quantity: product.value!.minQuantity || 1,
  });

  /**
   * Send Google Analytics event for an item added to wish list.
   */
  ga.addItemToWishList(product.value!);
}

async function createLists() {
  if (!newLists.value.length) {
    return;
  }

  await asyncForEach(newLists.value, async (newList) => {
    const newListId = await createWishlist({ listName: newList.listName.trim() });

    if (newListId) {
      selectedListsOtherIds.value.push(newListId);
    }
  });

  newLists.value = [];

  /**
   * Send Google Analytics event for an item added to wish list.
   */
  ga.addItemToWishList(product.value!);
}

async function removeProductFromWishlists() {
  const payload = removedLists.value.map((listId) => {
    return {
      listId,
      productId: product.value.id,
    };
  });

  if (payload.length) {
    await removeItemsFromWishlists(payload);
  }
}

async function save() {
  newLists.value.forEach((newList) => {
    if (!newList.listName.trim().length) {
      newList.errorMessage = t("shared.wishlists.add_to_wishlists_modal.is_required_validation_error");
    } else {
      newList.errorMessage = "";
    }
  });

  const newListsWithErrors = newLists.value.filter((newList) => !!newList.errorMessage?.length);

  if (newListsWithErrors.length) {
    return;
  }

  loading.value = true;

  await createLists();
  await removeProductFromWishlists();
  await addToWishlistsFromListOther();
  await refetchProductWishlists();

  emit("result", !!productWishlistsResult.value?.product?.wishlistIds?.length);

  closeModal();
  loading.value = false;

  notifications.success({
    duration: DEFAULT_NOTIFICATION_DURATION,
    singleInGroup: true,
    html: t("shared.wishlists.add_to_wishlists_modal.notification_success"),
  });
}

onMounted(async () => {
  await fetchProductWishlists();
  await fetchWishlists();
});
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
