<template>
  <VcButton
    v-if="$cfg.rating_enabled && isAuthenticated && !alreadySubmitted"
    :size="size"
    :is-outline="isOutline"
    class="whitespace-nowrap uppercase"
    @click="openLeaveFeedbackDialog"
  >
    <i v-if="withIcon" class="far fa-comment mr-3" />
    {{ $t("pages.vendor.leave_feedback") }}
  </VcButton>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { Filters, TermFilter } from "@/core/types";
import { nameof } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { useCustomerReviews } from "@/shared/vendor/composables";
import { VcButton } from "@/ui-kit/components";
import { default as CreateCustomerReviewModal } from "./create-customer-review-modal.vue";
import type { ICustomerReviewOptions } from "../types";
import type { CustomerReview } from "@/xapi/types";

interface IProps {
  options: ICustomerReviewOptions;
  isOutline?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  withIcon?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  isOutline: true,
  size: "xs",
  withIcon: false,
});

const { openPopup } = usePopup();
const { user, isAuthenticated } = useUser();
const { load: loadCustomerReviews, total: alreadySubmitted } = useCustomerReviews(
  props.options,
  undefined,
  undefined,
  new Filters()
);

function openLeaveFeedbackDialog(): void {
  openPopup({
    component: CreateCustomerReviewModal,
    props: {
      options: props.options,
    },
  });
}

watch(
  user,
  (userValue) => {
    loadCustomerReviews({
      filters: new Filters(new TermFilter(nameof<CustomerReview>("userId"), [userValue.id])),
    });
  },
  { immediate: true }
);
</script>
