<template>
  <div v-if="configurationItems?.length" class="rounded border bg-neutral-50 px-4 py-2">
    <button type="button" class="flex items-center gap-1 text-xs font-bold" @click="isCollapsed = !isCollapsed">
      <span>{{ $t("shared.cart.configuration_items.title") }}</span>

      <VcIcon class="text-primary" :name="isCollapsed ? 'chevron-down' : 'chevron-up'" size="xs" />
    </button>

    <ul class="space-y-1.5 pt-2 text-xs" :class="{ hidden: isCollapsed }">
      <li v-for="(configurationItem, index) in configurationItems" :key="configurationItem.id">
        {{ `${index + 1}. ${configurationItem.name}` }}
      </li>
      <li>
        <VcButton v-if="allowEdit" size="xs" :to="getRoute()" append-icon="edit" variant="outline">
          Edit configuration
        </VcButton>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  configurationItems: {
    id: string;
    name?: string;
  }[];
  lineItemId?: string;
  allowEdit?: boolean;
  route?: RouteLocationRaw;
}

const props = defineProps<IProps>();
const configurationItems = toRef(props, "configurationItems");
const lineItemId = toRef(props, "lineItemId");

const isCollapsed = ref<boolean>(true);

function getRoute() {
  if (typeof props.route === "string") {
    return { path: props.route, query: { lineItemId: lineItemId.value } };
  }
  if (typeof props.route === "object") {
    return { ...props.route, query: { lineItemId: lineItemId.value } };
  }
  return "";
}
</script>
