<template>
  <VcModal
    ref="modalComponent"
    :title="t(task ? 'sales_rep.tasks.form.edit_title' : 'sales_rep.tasks.form.create_title')"
    class="sales-rep-task-modal"
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
        :message="errors.name"
        :error="!!errors.name"
        required
      />

      <!-- enable-teleport: inside a modal the popover would otherwise clip against the dialog's overflow. -->
      <VcDatePicker
        v-model="dueDate"
        :label="t('sales_rep.tasks.form.due_date_label')"
        :disabled="loading"
        :message="errors.dueDate"
        :error="!!errors.dueDate"
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

      <!-- Absent when nobody has configured the TaskManagement.TaskTypes dictionary; the field is optional. -->
      <VcSelect
        v-if="types.length"
        v-model="type"
        :label="t('sales_rep.tasks.form.type_label')"
        :items="types"
        :disabled="loading"
        clearable
        enable-teleport
      />

      <VcTextarea
        v-model="description"
        :label="t('sales_rep.tasks.form.description_label')"
        :placeholder="t('common.placeholders.enter_value')"
        :disabled="loading"
        rows="4"
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
import { useNotifications } from "@/shared/notification";
import { VcModal } from "@/ui-kit/components";
import { useSalesRepTaskMutations } from "../composables/useSalesRepTaskMutations";
import { useSalesRepTaskTypes } from "../composables/useSalesRepTaskTypes";
import { localDayKey, localDayKeyToIso } from "../tasks";
import type { SalesRepTaskType } from "../types/tasks";

interface IProps {
  /** Omit to create. */
  task?: SalesRepTaskType;
  /** Pre-selects the due date when creating from a calendar cell ("YYYY-MM-DD"). */
  defaultDay?: string;
  /** Lets the caller refetch; the modal owns no list. */
  onSaved?: () => void;
}

const props = defineProps<IProps>();

// Mirrors the WorkTask.Name column width. Nothing server-side rejects a longer value today, so this input cap
// is what actually keeps a name inside the column.
const MAX_NAME_LENGTH = 256;

const PRIORITIES = ["Lowest", "Low", "Normal", "High", "Highest"] as const;

const { t } = useI18n();
const notifications = useNotifications();
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
function buildInitialValues() {
  return {
    name: props.task?.name ?? "",
    // The picker speaks local "YYYY-MM-DD"; the API speaks instants (see tasks.ts).
    dueDate: props.task?.dueDate ? localDayKey(props.task.dueDate) : (props.defaultDay ?? localDayKey(new Date())),
    priority: props.task?.priority || "Normal",
    type: props.task?.type ?? "",
    description: props.task?.description ?? "",
  };
}

const { errors, meta, handleSubmit } = useForm({ initialValues: buildInitialValues() });

const { value: name } = useField<string>("name", toTypedSchema(string().trim().required().max(MAX_NAME_LENGTH)));
const { value: dueDate } = useField<string>("dueDate", toTypedSchema(string().required()));
const { value: priority } = useField<string>("priority");
const { value: type } = useField<string>("type");
const { value: description } = useField<string>("description");

const save = handleSubmit(async (data) => {
  const input = {
    name: data.name.trim(),
    dueDate: localDayKeyToIso(data.dueDate),
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
  props.onSaved?.();
  modalComponent.value?.close();
});

async function remove(): Promise<void> {
  if (!props.task || !(await removeTask(props.task.id))) {
    return;
  }

  notifications.success({ text: t("sales_rep.tasks.form.deleted"), duration: 5000, single: true });
  props.onSaved?.();
  modalComponent.value?.close();
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
