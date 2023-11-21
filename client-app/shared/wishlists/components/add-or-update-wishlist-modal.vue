<template>
  <VcPopup
    :title="
      isEditMode
        ? $t('shared.wishlists.add_or_update_wishlist_dialog.edit_mode_title')
        : $t('shared.wishlists.add_or_update_wishlist_dialog.title')
    "
    modal-width="max-w-xl"
  >
    <div class="px-6 pb-6 pt-5">
      <VcInput
        v-model="name"
        :label="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_dialog.list_name_placeholder')"
        :disabled="loading"
        :message="errors.name"
        :error="!!errors.name && meta.dirty"
        required
      />
    </div>

    <div class="px-6 pb-6">
      <VcTextarea v-model="description" :label="$t('common.labels.description')" :disabled="loading" rows="4" />
    </div>

    <div class="border-b px-6 pb-6">
      <VcCheckbox v-model="isPrivate">
        {{ $t("common.labels.private_list") }}
      </VcCheckbox>
    </div>

    <template #actions="{ close }">
      <div class="flex grow space-x-4 sm:justify-between sm:space-x-10">
        <div class="flex grow justify-end gap-4">
          <VcButton color="secondary" variant="outline" class="flex-1 sm:flex-none" @click="close">
            {{ $t("shared.wishlists.add_or_update_wishlist_dialog.cancel_button") }}
          </VcButton>

          <VcButton :loading="loading" :disabled="!canSave" class="flex-1 sm:flex-none" @click="save(close)">
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
import { bool, object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const listName = computed<string | undefined>(() => props.list?.name);
const listDescription = computed<string | undefined>(() => props.list?.description);
const listIsPrivate = computed<boolean>(() => !props.list?.scope || props.list?.scope === WishlistScopeType.Private);

const { loading, createWishlist, updateWishlist } = useWishlists();

const validationSchema = toTypedSchema(
  object({
    name: string().required().max(25),
    description: string(),
    isPrivate: bool(),
  }),
);

const { errors, meta } = useForm({
  validationSchema,
  initialValues: {
    name: listName.value,
    description: listDescription.value || "",
    isPrivate: listIsPrivate.value,
  },
  validateOnMount: true,
});

const { value: name } = useField<string | undefined>("name");
const { value: description } = useField<string | undefined>("description");
const { value: isPrivate } = useField<boolean | undefined>("isPrivate");

const isEditMode = computed<boolean>(() => !!props.list);
const canSave = computed<boolean>(() => meta.value.dirty && meta.value.valid);

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid) {
    return;
  }

  const scope = isPrivate.value ? WishlistScopeType.Private : WishlistScopeType.Organization;

  if (isEditMode.value) {
    await updateWishlist({
      listId: props.list!.id!,
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope,
    });
  } else {
    await createWishlist({
      listName: name.value?.trim(),
      description: description.value?.trim(),
      scope,
    });
  }

  closeHandle();
}

/*
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import { string } from "yup";
import { useWishlists } from "../composables/useWishlists";
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
      listName: listName.value.trim(),
    });
  } else {
    await createWishlist(listName.value.trim());
  }

  closingHandle();
}
*/
</script>
