<template>
  <VcModal
    :title="
      isEditMode
        ? $t('shared.wishlists.add_or_update_wishlist_modal.edit_mode_title')
        : $t('shared.wishlists.add_or_update_wishlist_modal.title')
    "
    modal-width="max-w-xl"
  >
    <div class="px-6 pb-6 pt-5">
      <VcInput
        v-model="name"
        :label="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_label')"
        :placeholder="$t('shared.wishlists.add_or_update_wishlist_modal.list_name_placeholder')"
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
      <VcSwitch v-model="isShared" label-position="right">
        {{ $t("shared.wishlists.add_or_update_wishlist_modal.make_shared") }}
      </VcSwitch>
    </div>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.add_or_update_wishlist_modal.cancel_button") }}
      </VcButton>

      <VcButton :loading="loading" :disabled="!canSave" class="ms-auto" @click="save(close)">
        {{
          isEditMode
            ? $t("shared.wishlists.add_or_update_wishlist_modal.save_button")
            : $t("shared.wishlists.add_or_update_wishlist_modal.create_button")
        }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed } from "vue";
import { bool, object, string } from "yup";
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account/composables";
import { useWishlists } from "../composables/useWishlists";
import type { WishlistType } from "@/core/api/graphql/types";

interface IProps {
  list?: WishlistType;
}

const props = defineProps<IProps>();

const listName = computed<string | undefined>(() => props.list?.name);
const listDescription = computed<string | undefined>(() => props.list?.description);
const listIsShared = computed<boolean>(() => props.list?.scope === WishlistScopeType.Organization);

const { loading, createWishlist, updateWishlist } = useWishlists();
const { isCorporateMember } = useUser();

const MAX_DESCRIPTION_LENGTH = 250;

const validationSchema = toTypedSchema(
  object({
    name: string().required().max(25),
    description: string().max(MAX_DESCRIPTION_LENGTH),
    isShared: bool(),
  }),
);

const { errors, meta } = useForm({
  validationSchema,
  initialValues: {
    name: listName.value,
    description: listDescription.value ?? "",
    isShared: listIsShared.value,
  },
  validateOnMount: true,
});

const { value: name } = useField<string | undefined>("name");
const { value: description } = useField<string | undefined>("description");
const { value: isShared } = useField<boolean | undefined>("isShared");

const isEditMode = computed<boolean>(() => !!props.list);
const canSave = computed<boolean>(() => meta.value.dirty && meta.value.valid);

async function save(closeHandle: () => void): Promise<void> {
  if (!meta.value.valid) {
    return;
  }

  const scope = isShared.value ? WishlistScopeType.Organization : WishlistScopeType.Private;

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
</script>
