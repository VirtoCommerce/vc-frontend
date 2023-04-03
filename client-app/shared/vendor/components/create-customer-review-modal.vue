<template>
  <VcPopup
    :title="$t('pages.vendor.leave_feedback_dialog.title')"
    modal-width="max-w-xl"
    hide-actions
    is-mobile-fullscreen
  >
    <template #default="{ close }">
      <CustomerReviewForm @save="saveCustomerReview">
        <template #append="{ dirty, valid }">
          <div class="flex space-x-4 md:place-content-end">
            <VcButton kind="secondary" size="md" class="px-5 uppercase max-md:w-1/2" is-outline @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton
              :is-disabled="!dirty || !valid"
              size="md"
              class="px-5 uppercase max-md:w-1/2"
              is-submit
              @click="close"
            >
              {{ $t("common.buttons.submit") }}
            </VcButton>
          </div>
        </template>
      </CustomerReviewForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useCustomerReviews } from "@/shared/vendor/composables";
import { VcButton, VcPopup } from "@/ui-kit/components";
import { default as CustomerReviewForm } from "./customer-review-form.vue";
import type { ICustomerReview, ICustomerReviewOptions } from "@/shared/vendor/types";

interface IProps {
  options: ICustomerReviewOptions;
}

const props = defineProps<IProps>();

const { create } = useCustomerReviews(props.options);

const saveCustomerReview = async (customerReview: ICustomerReview) => {
  await create(customerReview);
};
</script>
