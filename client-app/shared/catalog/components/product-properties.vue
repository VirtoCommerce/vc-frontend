<template>
  <div class="flex flex-col">
    <div class="flex items-center mb-4">
      <img src="/assets/static/images/technical_specs.svg" alt="technical specs" />
      <h2 class="text-xl font-bold uppercase ml-2">Technical specs</h2>
    </div>
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
  </div>
</template>
<script setup lang="ts">
import _ from "lodash";
import { computed } from "vue";
import { Maybe, Property } from "@core/api/graphql/types";

const props = defineProps<{ properties: Array<Maybe<Property>> }>();

const grouped = computed(() => {
  var propertyGroups = _(props.properties)
    .filter((p) => !!p)
    .groupBy((p) => p!.name)
    .map((props, propName) => {
      return {
        name: propName,
        values: props.map((x) => x!.value).join(", "),
      };
    })
    .value();

  return propertyGroups;
});
</script>
