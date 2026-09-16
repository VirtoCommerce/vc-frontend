<template>
  <VcPopover
    v-if="!isMobile"
    placement="bottom-end"
    class="returns-filters"
    :offset-options="8"
    :disabled="disabled"
    lazy
  >
    <template #default="{ triggerProps }">
      <VcButton :disabled="disabled" variant="outline" v-bind="triggerProps">
        <VcIcon name="filter" />

        <span>{{ $t("common.buttons.filters") }}</span>
      </VcButton>
    </template>

    <template #content="{ close }">
      <div class="returns-filters__panel">
        <VcDialog dividers size="xs">
          <VcDialogHeader @close="close">
            {{ $t("returns.filters.title") }}
          </VcDialogHeader>

          <VcDialogContent>
            <ReturnsFilterFields v-model="draft" :statuses="statuses" @update:valid="isValid = $event" />
          </VcDialogContent>

          <VcDialogFooter>
            <VcButton
              color="secondary"
              variant="outline"
              :disabled="isEmpty && !isDirty"
              @click="
                reset();
                close();
              "
            >
              {{ $t("common.buttons.reset") }}
            </VcButton>

            <VcButton
              :disabled="!isDirty || !isValid"
              @click="
                apply();
                close();
              "
            >
              {{ $t("common.buttons.apply") }}
            </VcButton>
          </VcDialogFooter>
        </VcDialog>
      </div>
    </template>
  </VcPopover>

  <template v-else>
    <VcButton :disabled="disabled" variant="outline" @click="sidebarVisible = true">
      <VcIcon name="filter" />

      <span>{{ $t("common.buttons.filters") }}</span>
    </VcButton>

    <VcPopupSidebar :is-visible="sidebarVisible" :title="$t('returns.filters.title')" @hide="hideSidebar">
      <ReturnsFilterFields v-model="draft" :statuses="statuses" @update:valid="isValid = $event" />

      <template #footer>
        <VcButton
          color="secondary"
          variant="outline"
          icon="reset"
          :disabled="isEmpty && !isDirty"
          :aria-label="$t('common.buttons.reset')"
          @click="
            reset();
            sidebarVisible = false;
          "
        />

        <VcButton color="secondary" variant="outline" class="grow" @click="hideSidebar">
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton
          class="grow"
          :disabled="!isDirty || !isValid"
          @click="
            apply();
            sidebarVisible = false;
          "
        >
          {{ $t("common.buttons.apply") }}
        </VcButton>
      </template>
    </VcPopupSidebar>
  </template>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import ReturnsFilterFields from "./returns-filter-fields.vue";
import type { ReturnStatusOptionType, ReturnsFilterDataType } from "@/modules/returns/types";

interface IProps {
  statuses: ReturnStatusOptionType[];
  applied: ReturnsFilterDataType;
  disabled?: boolean;
}

interface IEmits {
  (event: "change", value: ReturnsFilterDataType): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), { disabled: false });

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const sidebarVisible = ref(false);
const isValid = ref(true);

const draft = ref<ReturnsFilterDataType>(emptyFilter());

const isEmpty = computed(() => !draft.value.statuses.length && !draft.value.startDate && !draft.value.endDate);
const isDirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(clone(props.applied)));

function apply(): void {
  emit("change", clone(draft.value));
}

function reset(): void {
  draft.value = emptyFilter();
  emit("change", emptyFilter());
}

function hideSidebar(): void {
  draft.value = clone(props.applied);
  sidebarVisible.value = false;
}

function emptyFilter(): ReturnsFilterDataType {
  return { statuses: [], startDate: undefined, endDate: undefined };
}

function clone(value: ReturnsFilterDataType): ReturnsFilterDataType {
  return { statuses: [...value.statuses], startDate: value.startDate, endDate: value.endDate };
}

// Seeds the draft and keeps it in step afterwards: the page can drop a single filter from its chips.
watch(
  () => props.applied,
  (value) => {
    draft.value = clone(value);
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss">
.returns-filters {
  &__panel {
    @apply w-[27.5rem] max-w-[calc(100vw-2rem)];
  }
}
</style>
