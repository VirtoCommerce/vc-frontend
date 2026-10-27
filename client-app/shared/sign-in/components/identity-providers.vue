<template>
  <div class="identity-providers">
    <ExtensionPoint
      v-for="providerName in providers"
      :key="providerName"
      :category="EXTENSION_CATEGORIES.identityProviders"
      :name="providerName"
      :return-url="returnUrl"
    >
      <component
        :is="loadProviderComponent(providerName)"
        v-if="isBuiltInProvider(providerName)"
        :return-url="returnUrl"
      />
    </ExtensionPoint>
  </div>
</template>

<script setup lang="ts">
import { useMemoize } from "@vueuse/core";
import { defineAsyncComponent } from "vue";
import { Logger } from "@/core/utilities";
import { EXTENSION_CATEGORIES } from "@/shared/common/constants/extensionPointsNames";
import { isBuiltInProvider } from "@/shared/sign-in/composables/useIdentityProviders";
import type { Component } from "vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

interface IProps {
  providers: string[];
  returnUrl: string;
}

defineProps<IProps>();

const loadProviderComponent = useMemoize(
  (providerName: string): Component =>
    defineAsyncComponent<Component>({
      loader: () => import(`./${providerName.toLowerCase()}-provider.vue`),
      // Renders nothing for a provider this theme does not ship, instead of leaving
      // the component pending forever.
      errorComponent: { render: () => null },
      onError(error, _retry, fail) {
        Logger.error(`Failed to load ${providerName} provider component`, error);
        fail();
      },
    }),
  { getKey: (providerName) => providerName.toLowerCase() },
);
</script>

<style lang="scss">
.identity-providers {
  @apply flex items-center gap-5 flex-col justify-center;
}
</style>
