<template>
  <div class="identity-providers">
    <component
      :is="loadProviderComponent(providerName)"
      v-for="providerName in providers"
      :key="providerName"
      :return-url="returnUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { Logger } from "@/core/utilities";
import type { Component } from "vue";

interface IProps {
  providers: string[];
  returnUrl: string;
}

defineProps<IProps>();

const providerComponents = new Map<string, Component>();

function loadProviderComponent(providerName: string): Component {
  const name = providerName.toLowerCase();
  let component = providerComponents.get(name);

  if (!component) {
    component = defineAsyncComponent<Component>({
      loader: () => import(`./${name}-provider.vue`),
      // Renders nothing for a provider this theme does not ship, instead of leaving
      // the component pending forever.
      errorComponent: { render: () => null },
      onError(error, _retry, fail) {
        Logger.error(`Failed to load ${providerName} provider component`, error);
        // Keeping the failed component would hold the button back until a page reload.
        providerComponents.delete(name);
        fail();
      },
    });

    providerComponents.set(name, component);
  }

  return component;
}
</script>

<style lang="scss">
.identity-providers {
  @apply flex items-center gap-5 flex-col justify-center;
}
</style>
