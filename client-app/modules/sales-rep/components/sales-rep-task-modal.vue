<template>
  <VcModal
    ref="modalComponent"
    :title="t(task ? 'sales_rep.tasks.form.edit_title' : 'sales_rep.tasks.form.create_title')"
    class="sales-rep-task-modal"
    :is-persistent="loading"
    is-mobile-fullscreen
    dividers
  >
    <form class="sales-rep-task-modal__form" @submit.prevent>
      <VcInput
        v-model="name"
        :label="t('sales_rep.tasks.form.name_label')"
        :placeholder="t('common.placeholders.enter_value')"
        :disabled="loading"
        :maxlength="MAX_NAME_LENGTH"
        :message="meta.dirty ? errors.name : undefined"
        :error="!!errors.name && meta.dirty"
        :aria="REQUIRED_ARIA"
        required
      />

      <!-- enable-teleport: inside a modal the popover would otherwise clip against the dialog's overflow. -->
      <VcDatePicker
        v-model="dueDate"
        :label="t('sales_rep.tasks.form.due_date_label')"
        :disabled="loading"
        :message="meta.dirty ? errors.dueDate : undefined"
        :error="!!errors.dueDate && meta.dirty"
        :aria="REQUIRED_ARIA"
        enable-teleport
        required
      />

      <VcSelect
        v-model="priority"
        :label="t('sales_rep.tasks.form.priority_label')"
        :items="priorityItems"
        text-field="label"
        value-field="value"
        :disabled="loading"
        enable-teleport
      />

      <!-- Absent when nobody has configured the TaskManagement.TaskTypes dictionary; the field is optional.
           `clearable` is bound rather than bare: VcSelect counts "" as a selection, so it would offer a Clear
           on an empty Type (QA M-2), and "" is this form's own convention for an unset field. -->
      <VcSelect
        v-if="types.length"
        v-model="type"
        :label="t('sales_rep.tasks.form.type_label')"
        :items="types"
        :disabled="loading"
        :clearable="!!type"
        enable-teleport
      />

      <VcTextarea
        v-model="description"
        :label="t('sales_rep.tasks.form.description_label')"
        :placeholder="t('common.placeholders.enter_value')"
        :disabled="loading"
        :max-length="MAX_DESCRIPTION_LENGTH"
        rows="4"
        counter
      />
    </form>

    <template #actions="{ close }">
      <VcButton
        v-if="task"
        class="sales-rep-task-modal__delete"
        color="danger"
        variant="outline"
        :disabled="loading"
        @click="remove"
      >
        {{ t("sales_rep.tasks.form.delete_button") }}
      </VcButton>

      <VcButton color="secondary" variant="outline" :disabled="loading" @click="close">
        {{ t("sales_rep.tasks.form.cancel_button") }}
      </VcButton>

      <!-- Disabled while the form is invalid, by product decision. That is QA A-18 (advisory, not an AA
           failure): a disabled control leaves the tab order and cannot say why it is unavailable. The
           requirement itself is still conveyed - Title carries `required` and `aria-required`. -->
      <VcButton :disabled="!meta.valid" :loading="loading" @click="save">
        {{ t("sales_rep.tasks.form.save_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { string } from "yup";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import { VcModal } from "@/ui-kit/components";
import { useSalesRepTaskMutations } from "../composables/useSalesRepTaskMutations";
import { useSalesRepTaskTypes } from "../composables/useSalesRepTaskTypes";
import { dueDateForDay, localDayKey } from "../tasks";
import type { SalesRepTaskType } from "../types/tasks";

interface IProps {
  /** Omit to create. */
  task?: SalesRepTaskType;
  /** Pre-selects the due date when creating from a calendar cell ("YYYY-MM-DD"). */
  defaultDay?: string;
  /**
   * Lets the caller refetch; the modal owns no list. A save reports the day it wrote ("YYYY-MM-DD") so the
   * caller can follow a task that moved to another date; a delete reports nothing.
   */
  onSaved?: (dayKey?: string) => void;
}

const props = defineProps<IProps>();

// Mirrors the WorkTask.Name column width. Nothing server-side rejects a longer value today, so this input cap
// is what actually keeps a name inside the column.
const MAX_NAME_LENGTH = 256;

// Notes live in a `text` column, so this is a layout guard rather than a storage limit; 1000 matches the
// storefront's other free-text areas (order comment, invite message) rather than the 250 of a one-line list
// description. Deliberately NOT mirrored in the yup schema: `maxlength` stops the rep typing past it, while a
// validation rule would also invalidate a longer description written in the admin task UI and lock the rep
// out of editing that task at all.
const MAX_DESCRIPTION_LENGTH = 1000;

// `required` only draws VcLabel's asterisk; it reaches neither the control nor assistive tech, so the
// requirement was exposed by no route at all (QA A-7). Both VcInput and VcDatePicker merge an `aria` map
// onto the control they render, so this is fixable here without touching the ui-kit.
const REQUIRED_ARIA = { "aria-required": "true" };

const PRIORITIES = ["Lowest", "Low", "Normal", "High", "Highest"] as const;

const { t } = useI18n();
const notifications = useNotifications();
const { openModal } = useModal();
const modalComponent = useTemplateRef<InstanceType<typeof VcModal>>("modalComponent");

const { create, update, remove: removeTask, loading } = useSalesRepTaskMutations();
const { types } = useSalesRepTaskTypes();

const priorityItems = computed(() =>
  PRIORITIES.map((value) => ({ value, label: t(`sales_rep.tasks.priority.${value.toLowerCase()}`) })),
);

/**
 * A deliberate snapshot, read inside a function rather than at root scope: useForm seeds the fields once, and a
 * modal instance is constructed per open with fixed props, so there is no later prop change to track.
 */
/**
 * The picker speaks local "YYYY-MM-DD"; the API speaks instants (see tasks.ts). Editing shows the task's own date
 * or nothing - a task with no due date arrives from the admin UI, and seeding "today" here would hand it one it
 * never had. Only a NEW task falls back to the selected day.
 */
function initialDueDate(): string {
  if (props.task) {
    return props.task.dueDate ? localDayKey(props.task.dueDate) : "";
  }

  return props.defaultDay ?? localDayKey(new Date());
}

function buildInitialValues() {
  return {
    name: props.task?.name ?? "",
    dueDate: initialDueDate(),
    priority: props.task?.priority || "Normal",
    type: props.task?.type ?? "",
    description: props.task?.description ?? "",
  };
}

// validateOnMount so `meta.valid` is honest before the rep touches anything - Save is disabled on an empty
// title from the outset, rather than only after the field has been visited. The error TEXT is held back
// until the form is dirty, or a new task would open with a complaint already on it.
const { errors, meta, handleSubmit } = useForm({
  initialValues: buildInitialValues(),
  validateOnMount: true,
});

const { value: name } = useField<string>("name", toTypedSchema(string().trim().required().max(MAX_NAME_LENGTH)));
const { value: dueDate } = useField<string>("dueDate", toTypedSchema(string().required()));
const { value: priority } = useField<string>("priority");
const { value: type } = useField<string>("type");
const { value: description } = useField<string>("description");

const save = handleSubmit(async (data) => {
  const input = {
    name: data.name.trim(),
    // The picked day, but not at midnight unless it already was: see dueDateForDay.
    dueDate: dueDateForDay(data.dueDate, props.task?.dueDate),
    priority: data.priority || undefined,
    type: data.type || undefined,
    description: data.description?.trim() || undefined,
  };

  const succeeded = props.task ? await update(props.task.id, input) : await create(input);
  if (!succeeded) {
    // useMutation keeps the global error toast for a failed write, so nothing extra to say here.
    return;
  }

  notifications.success({ text: t("sales_rep.tasks.form.saved"), duration: 5000, single: true });
  props.onSaved?.(data.dueDate);
  modalComponent.value?.close();
});

function remove(): void {
  // Deleting a task is not undoable and the button sits in the same row as Save, so it asks first. A failed
  // delete leaves the confirmation open to retry, per this module's convention (see useSalesRepTaskMutations).
  const closeConfirmation = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      loading,
      title: t("sales_rep.tasks.form.delete_title"),
      text: t("sales_rep.tasks.form.delete_confirm"),

      async onConfirm() {
        if (!props.task || !(await removeTask(props.task.id))) {
          return;
        }

        closeConfirmation();
        notifications.success({ text: t("sales_rep.tasks.form.deleted"), duration: 5000, single: true });
        props.onSaved?.();
        modalComponent.value?.close();
      },
    },
  });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-modal {
  &__form {
    @apply space-y-4;
  }

  // Pushed away from the confirm pair so Delete is not a neighbour of Save.
  &__delete {
    @apply me-auto;
  }
}
</style>
