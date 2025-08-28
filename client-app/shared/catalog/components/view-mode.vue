<template>
  <div class="view-mode" role="group">
    <VcTabSwitch
      v-model="viewMode"
      value="grid"
      icon="grid"
      :label="$t('shared.catalog.view_mode.grid_label')"
      :aria-label="$t('common.buttons.switch_to_grid_view')"
      data-test-id="view-switcher.grid-view-tab"
      @change="$emit('update:mode', $event)"
    >
      <span class="view-mode__text">
        {{ $t("shared.catalog.view_mode.grid_label") }}
      </span>
    </VcTabSwitch>

    <VcTabSwitch
      v-model="viewMode"
      value="list"
      icon="list"
      :label="$t('shared.catalog.view_mode.list_label')"
      :aria-label="$t('common.buttons.switch_to_list_view')"
      data-test-id="view-switcher.list-view-tab"
      @change="$emit('update:mode', $event)"
    >
      <span class="view-mode__text">
        {{ $t("shared.catalog.view_mode.list_label") }}
      </span>
    </VcTabSwitch>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IEmits {
  (event: "update:mode", mode: string): void;
}

interface IProps {
  mode?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: "grid",
});

const viewMode = computed(() => props.mode);
</script>

<style lang="scss">
.view-mode {
  @apply flex gap-2;

  &__text {
    @apply max-md:hidden;
  }
}
</style>
