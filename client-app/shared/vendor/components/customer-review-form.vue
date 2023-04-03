<template>
  <form class="flex flex-col gap-y-4 overflow-x-hidden px-6 py-4" @submit.prevent="save">
    <slot name="prepend" v-bind="slotsData" />

    <VcRating
      v-model="rating"
      :label="isMobile ? undefined : $t('pages.vendor.leave_feedback_dialog.rating_label')"
      variant="stars"
      :size="isMobile ? 'xl' : 'md'"
    ></VcRating>

    <VcInput
      v-model.trim="title"
      :message="errors.title"
      :error="!!errors.title"
      :label="$t('pages.vendor.leave_feedback_dialog.title_label')"
      :placeholder="$t('pages.vendor.leave_feedback_dialog.title_placeholder')"
      required
    />

    <VcTextarea
      v-model.trim="review"
      :message="errors.review"
      :error="!!errors.review"
      :label="$t('pages.vendor.leave_feedback_dialog.review_label')"
      :placeholder="$t('pages.vendor.leave_feedback_dialog.review_placeholder')"
      required
    />

    <slot name="append" v-bind="slotsData" />
  </form>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { clone } from "lodash";
import { useField, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { string as yupString } from "yup";
import { Logger } from "@/core/utilities";
import { VcInput, VcRating, VcTextarea } from "@/ui-kit/components";
import type { ICustomerReview } from "../types";

interface IEmits {
  (event: "update:modelValue", customerReview: ICustomerReview): void;
  (event: "save", customerReview: ICustomerReview): void;
}

interface IProps {
  modelValue?: ICustomerReview;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const _emptyCustomeReview: Readonly<ICustomerReview> = {
  rating: 5,
  title: "",
  review: "",
};

const initialValues = ref<ICustomerReview>(clone(props.modelValue || _emptyCustomeReview));

const {
  values,
  meta,
  errors,
  handleSubmit,
  setValues,
  setErrors,
  validate,
  resetForm: reset,
} = useForm({ initialValues });

const slotsData = computed(() => ({
  setErrors,
  validate,
  reset,
  save,
  errors,
  values,
  dirty: meta.value.dirty,
  valid: meta.value.valid,
  validated: meta.value.validated,
  pending: meta.value.pending,
  touched: meta.value.touched,
}));

const { value: rating } = useField<number>("rating", yupString().required().nullable(), { syncVModel: false });
const { value: title } = useField<string>("title", yupString().required().nullable(), { syncVModel: false });
const { value: review } = useField<string>("review", yupString().required().nullable(), { syncVModel: false });

const save = handleSubmit((customerReview) => {
  emit("update:modelValue", customerReview);
  emit("save", customerReview);
}, Logger.debug);

watch(
  () => props.modelValue,
  (value) => {
    initialValues.value = clone(value || _emptyCustomeReview);
    setValues(initialValues.value);
  },
  { deep: true }
);
</script>
