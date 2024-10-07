<template>
  <NestedMobileHeader>
    <template #left>
      <VcButton :to="to" prepend-icon="chevron-left" size="sm" class="ml-5" @click="$emit('click')">
        <slot>{{ $t("common.buttons.back") }}</slot>
      </VcButton>
    </template>
  </NestedMobileHeader>
</template>

<script setup lang="ts">
import NestedMobileHeader from "../nested-mobile-header/nested-mobile-header.vue";
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

defineEmits(["click"]);

defineProps({
  to: [String, Object] as PropType<RouteLocationRaw>,
});
</script>
