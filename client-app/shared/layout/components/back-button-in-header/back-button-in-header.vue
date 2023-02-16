<template>
  <NestedMobileHeader>
    <template #left>
      <VcButton :to="to" class="ml-6 px-3" @click="$emit('click')">
        <i class="fas fa-chevron-left -ml-0.5" />

        <span class="ml-2">
          <slot>{{ $t("common.buttons.back") }}</slot>
        </span>
      </VcButton>
    </template>
  </NestedMobileHeader>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteLocationRaw } from "vue-router";
import NestedMobileHeader from "../nested-mobile-header/nested-mobile-header";

defineEmits(["click"]);

defineProps({
  to: [String, Object] as PropType<RouteLocationRaw>,
});
</script>
