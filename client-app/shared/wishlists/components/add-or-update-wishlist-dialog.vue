<template>
  <VcPopup
    :title="
      isEditMode
        ? $t('shared.wishlists.add_or_update_wishlist_dialog.edit_mode_title')
        : $t('shared.wishlists.add_or_update_wishlist_dialog.title')
    "
    modal-width="max-w-xl"
  >
    <div class="px-6 pt-5 pb-6 border-b">
      <VcInput
        v-model="listName"
        :label="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_placeholder')"
        :is-disabled="loading"
        :error-message="errors[0]"
        is-required
        autofocus
      />
    </div>

    <template #actions="{ close }">
      <div class="flex grow sm:justify-between space-x-4 sm:space-x-10">
        <!-- TODO: add color options (success, warning, danger) to VcButton -->
        <VcButton
          v-if="isEditMode"
          class="uppercase max-w-[10rem] grow sm:grow-0 sm:px-4 hover:!bg-[color:var(--color-danger-hover)] !bg-[color:var(--color-danger)]"
          @click="openDeleteDialog"
        >
          <span class="hidden sm:inline">{{ $t("shared.wishlists.add_or_update_wishlist_dialog.delete_button") }}</span>
          <span class="sm:hidden">{{ $t("shared.wishlists.add_or_update_wishlist_dialog.delete_button_mobile") }}</span>
        </VcButton>

        <div class="flex grow justify-end space-x-4">
          <VcButton kind="secondary" class="uppercase grow sm:grow-0 sm:px-5" is-outline @click="close">
            {{ $t("shared.wishlists.add_or_update_wishlist_dialog.cancel_button") }}
          </VcButton>

          <VcButton
            :is-waiting="loading"
            :is-disabled="!meta.valid || !meta.dirty"
            :class="isEditMode ? 'px-4 sm:px-12' : 'sm:px-5'"
            class="uppercase grow sm:grow-0"
            @click="save(close)"
          >
            {{
              isEditMode
                ? $t("shared.wishlists.add_or_update_wishlist_dialog.save_button")
                : $t("shared.wishlists.add_or_update_wishlist_dialog.create_button")
            }}
          </VcButton>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcButton, VcInput, VcPopup } from "@/components";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { DeleteWishlistsDialog, useWishlists } from "@/shared/wishlists";
import { PropType } from "vue";
import { WishlistType } from "@core/api/graphql/types";
import { eagerComputed } from "@vueuse/core";
import { usePopup } from "@/shared/popup";
import { useI18n } from "vue-i18n";

const props = defineProps({
  list: {
    type: Object as PropType<WishlistType | null>,
    default: null,
  },
});

useForm({ initialValues: { listName: props.list?.name || "" } });

const { t } = useI18n();
const { openPopup, closePopup } = usePopup();
const { loading, createWishlist, renameWishlist } = useWishlists();
const {
  value: listName,
  meta,
  errors,
} = useField<string>(
  "listName",
  yup.string().label(t("shared.wishlists.add_or_update_wishlist_dialog.list_name_label")).max(64).required().nullable()
);

const isEditMode = eagerComputed(() => !!props.list);

function openDeleteDialog() {
  closePopup();

  openPopup({
    component: DeleteWishlistsDialog,
    props: {
      list: props.list,
    },
  });
}

async function save(closingHandle: () => void) {
  if (!listName.value || errors.value.length) return;

  if (isEditMode.value) {
    await renameWishlist({
      listId: props.list!.id!,
      listName: listName.value,
    });
  } else {
    await createWishlist(listName.value);
  }

  closingHandle();
}
</script>
