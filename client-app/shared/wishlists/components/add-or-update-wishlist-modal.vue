<template>
  <VcPopup
    :title="
      isEditMode
        ? $t('shared.wishlists.add_or_update_wishlist_dialog.edit_mode_title')
        : $t('shared.wishlists.add_or_update_wishlist_dialog.title')
    "
    modal-width="max-w-xl"
  >
    <div class="border-b px-6 pb-6 pt-5">
      <VcInput
        v-model.trim="listName"
        :label="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_placeholder')"
        :disabled="loading"
        :message="errors[0]"
        :error="!!errors[0]"
        required
      />
    </div>

    <template #actions="{ close }">
      <div class="flex grow space-x-4 sm:justify-between sm:space-x-10">
        <div class="flex grow justify-end gap-4">
          <VcButton color="secondary" variant="outline" class="flex-1 sm:flex-none" @click="close">
            {{ $t("shared.wishlists.add_or_update_wishlist_dialog.cancel_button") }}
          </VcButton>

          <VcButton
            :loading="loading"
            :disabled="!meta.valid || !meta.dirty"
            class="flex-1 sm:flex-none"
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
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import { string } from "yup";
import useWishlists from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

useForm({ initialValues: { listName: props.list?.name || "" } });

const { loading, createWishlist, renameWishlist } = useWishlists();
const { value: listName, meta, errors } = useField<string>("listName", toTypedSchema(string().required().max(25)));

const isEditMode = computed(() => !!props.list);

async function save(closingHandle: () => void) {
  if (!listName.value || errors.value.length) {
    return;
  }

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
