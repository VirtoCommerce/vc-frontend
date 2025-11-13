<template>
  <HugeiconsIcon
    v-if="iconComponent"
    :icon="iconComponent"
    :size="computedSize"
    :color="colorValue"
    :stroke-width="strokeWidth"
  />
</template>

<script setup lang="ts">
import { loadIcon } from "@hugeicons/core-free-icons/loader";
import { HugeiconsIcon } from "@hugeicons/vue";
import { computed, ref, watch } from "vue";
import { Logger } from "@/core/utilities";
import { getColorValue } from "@/ui-kit/utilities";

type IconSvgObjectType = Awaited<ReturnType<typeof loadIcon>>;

interface IProps {
  name?: string;
  size?: VcIconSizeType;
  color?: string;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "File01Icon",
  color: "",
  strokeWidth: 1.5,
});

const iconComponent = ref<IconSvgObjectType | null>(null);

async function loadIconComponent(iconName: string) {
  if (!iconName) {
    iconComponent.value = null;
    return;
  }

  try {
    const icon = await loadIcon(iconName);
    iconComponent.value = icon;
  } catch (error) {
    Logger.error(`Failed to load icon: ${iconName}`, error);
    iconComponent.value = null;
  }
}

watch(
  () => props.name,
  (newName) => {
    if (newName) {
      void loadIconComponent(newName);
    } else {
      iconComponent.value = null;
    }
  },
  { immediate: true },
);

const sizeMap: Record<string, number> = {
  xxs: 10,
  xs: 14,
  sm: 20,
  md: 24,
  lg: 40,
  xl: 48,
  xxl: 64,
};

const computedSize = computed(() => {
  if (typeof props.size === "number") {
    return props.size;
  }
  if (typeof props.size === "string" && sizeMap[props.size]) {
    return sizeMap[props.size];
  }
  return 24;
});

const colorValue = computed(() => getColorValue(props.color));
</script>
