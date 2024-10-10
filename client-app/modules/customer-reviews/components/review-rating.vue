<template>
  <div class="space-x-2 text-nowrap text-neutral-300">
    <VcIcon
      v-for="i in 5"
      :key="i"
      :class="{ 'text-warning': i <= rating || (!readOnly && selectedRating >= i), 'cursor-pointer': !readOnly }"
      name="whishlist"
      size="sm"
      @click="setRating(i)"
      @focus="handleMouseOver(i)"
      @blur="handleMouseOver(0)"
      @mouseover="handleMouseOver(i)"
      @mouseleave="handleMouseOver(0)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface IEmits {
  (event: "setRating", value: number): void;
}
interface IProps {
  rating: number;
  readOnly?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const selectedRating = ref(0);

function handleMouseOver(value: number): void {
  if (props.readOnly) {
    return;
  }

  selectedRating.value = value;
}

function setRating(value: number): void {
  if (props.readOnly) {
    return;
  }

  emit("setRating", value);
}
</script>
