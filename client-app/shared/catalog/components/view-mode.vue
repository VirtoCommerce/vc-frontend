<template>
  <div class="space-x-2" role="group">
    <VcTabSwitch
      v-model="viewMode"
      value="grid"
      icon="grid"
      :label="$t('shared.catalog.view_mode.grid_label')"
      @change="$emit('update:mode', $event as string)"
    />

    <VcTabSwitch
      v-model="viewMode"
      value="list"
      icon="list"
      :label="$t('shared.catalog.view_mode.list_label')"
      @change="$emit('update:mode', $event as string)"
    />
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
