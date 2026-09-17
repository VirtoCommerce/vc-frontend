<template>
  <div class="assistant">
    <VcTypography tag="h1" variant="h2" class="assistant__heading">
      {{ $t("commerce_agent.pages.assistant.title") }}
    </VcTypography>

    <VcLoaderOverlay v-if="isStarting" />

    <VcAlert v-else-if="failure === 'not_signed_in'" color="warning" variant="solid-light" size="sm">
      {{ $t("commerce_agent.messages.sign_in_first") }}
    </VcAlert>

    <VcAlert v-else-if="failure" color="danger" variant="solid-light" size="sm">
      {{ $t("commerce_agent.messages.service_unavailable") }}
    </VcAlert>

    <AgentConversation v-else />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useShortCart } from "@/shared/cart";
import AgentConversation from "../components/agent-conversation.vue";
import { useCommerceAgent } from "../composables/useCommerceAgent";

const { t } = useI18n();
const { start, stop, isStarting, failure, cart } = useCommerceAgent();
// Resolved in setup: the callback below runs outside an injection context.
const { refetch: refetchShortCart } = useShortCart();

usePageHead({ title: t("commerce_agent.pages.assistant.title") });

// The agent writes to the cart over its own API, so nothing invalidates the storefront's
// GetShortCart cache (cache-first) and the header counter keeps the count it booted with.
watch(cart, () => {
  void refetchShortCart();
});

onMounted(start);
onBeforeUnmount(stop);
</script>

<style lang="scss">
.assistant {
  @apply flex flex-col gap-5;

  &__heading {
    @apply mb-0;
  }
}
</style>
