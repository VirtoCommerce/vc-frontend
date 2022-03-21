<template>
  <div v-for="property in grouped" :key="property.name" class="flex mb-4 space-x-3">
    <div class="flex w-1/2 space-x-3">
      <div class="flex-shrink text-gray-500">
        {{ property?.name }}
      </div>
      <div class="flex-1 border-b border-grey-100 border-dotted h-5"></div>
    </div>
    <div class="font-bold w-1/2 flex flex-col text-left">
      {{ property.values }}
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { computed, PropType } from "vue";
import { Property } from "@core/api/graphql/types";

const props = defineProps({
  properties: {
    type: Array as PropType<Property[]>,
    default: () => [],
  },
});

// todo: move this logic to the separated helper. For variations properties also
const grouped = computed(() => {
  return _(props.properties)
    .filter((p) => !!p && p.type === "Product")
    .groupBy((p) => p.name)
    .map((properties, propName) => {
      return {
        name: propName,
        values: properties.map((x) => x.value).join(", "),
      };
    })
    .value();
});
</script>
