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

    <div :class="{ 'border-b': !isCorporateMember }" class="px-6 pb-6">
      <VcTextarea
        v-model="description"
        :label="$t('common.labels.description')"
        :disabled="loading"
        :message="errors.description"
        :error="!!errors.description && meta.dirty"
        rows="4"
        counter
        :max-length="MAX_DESCRIPTION_LENGTH"
      />
    </div>

    <div v-if="isCorporateMember" class="border-b px-6 pb-6">
      <VcCheckbox v-model="isPrivate">
        {{ $t("shared.wishlists.add_or_update_wishlist_dialog.private_list") }}
      </VcCheckbox>
    </div>

    <template #actions="{ close }">
      <div class="flex grow space-x-4 sm:justify-between sm:space-x-10">
        <div class="flex grow justify-end gap-4">
          <VcButton color="secondary" variant="outline" class="flex-1 sm:flex-none" @click="close">
            {{ $t("shared.wishlists.add_or_update_wishlist_dialog.cancel_button") }}
          </VcButton>

          <VcButton :loading="loading" :disabled="!meta.valid" class="flex-1 sm:flex-none" @click="save(close)">
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
import { computed, watch } from "vue";
import { bool, object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const { loading, createWishlist, updateWishlist } = useWishlists();
const { isCorporateMember } = useUser();

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = toTypedSchema(
  object({
    name: string().required().max(25),
    description: string().max(MAX_DESCRIPTION_LENGTH),
    isPrivate: bool(),
  }),
);

const { errors, meta, resetForm } = useForm({
  validationSchema,
  initialValues: getFormValues(),
});

function getFormValues() {
  return {
    name: props.list?.name,
    description: props.list?.description,
    isPrivate: !props.list?.scope || props.list?.scope === WishlistScopeType.Private,
  };
}

const { value: name } = useField<string>("name");
const { value: description } = useField<string | undefined>("description");
const { value: isPrivate } = useField<boolean>("isPrivate");

const isEditMode = computed<boolean>(() => !!props.list);

async function save(close: () => void): Promise<void> {
  const payload = {
    listName: name.value.trim(),
    description: description.value?.trim(),
    scope: isPrivate.value ? WishlistScopeType.Private : WishlistScopeType.Organization,
  };

  if (props.list) {
    await updateWishlist({
      listId: props.list.id,
      ...payload,
    });
  } else {
    await createWishlist(payload);
  }

  close();
}

watch(
  () => props.list,
  () => resetForm({ values: getFormValues() }),
);
</script>
