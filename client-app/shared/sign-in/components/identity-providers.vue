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

defineProps<IProps>();

const providerComponents = new Map<string, Component>();

function loadProviderComponent(providerName: string): Component {
  const name = providerName.toLowerCase();

  if (!providerComponents.has(name)) {
    providerComponents.set(
      name,
      defineAsyncComponent<Component>({
        loader: () => import(`./${name}-provider.vue`),
        onError(error, _retry, fail) {
          Logger.error(`Failed to load ${providerName} provider component`, error);
          fail();
        },
      }),
    );
  }

  return providerComponents.get(name)!;
}

interface IProps {
  providers: string[];
  returnUrl: string;
}
</script>

<style lang="scss">
.identity-providers {
  @apply flex items-center gap-5 flex-col justify-center;
}
</style>
