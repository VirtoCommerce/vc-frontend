<template>
  <div class="agent-conversation">
    <ol ref="transcript" class="agent-conversation__turns">
      <li v-for="(turn, index) in turns" :key="index" class="agent-conversation__turn">
        <p v-if="turn.role === 'user'" class="agent-conversation__asked">{{ turn.text }}</p>

        <template v-else>
          <!-- What the agent is doing, while it does it: a turn can take half a minute. -->
          <ol v-if="turn.steps.length" class="agent-conversation__steps">
            <li
              v-for="step in turn.steps"
              :key="step.id"
              class="agent-conversation__step"
              :class="{
                'agent-conversation__step--done': step.done,
                'agent-conversation__step--failed': step.failed,
              }"
            >
              {{ step.label }}
            </li>
          </ol>

          <p v-if="turn.text" class="agent-conversation__said">{{ turn.text }}</p>

          <template v-for="(component, position) in turn.components" :key="position">
            <AgentProducts
              v-if="component.component === 'products'"
              :payload="component.payload as unknown as IAgentProductsPayload"
            />

            <AgentSuggestions
              v-else-if="component.component === 'suggestions'"
              :payload="component.payload as unknown as IAgentSuggestionsPayload"
              :disabled="isAnswering"
              @select="ask"
            />

            <VcAlert v-else color="info" size="sm" variant="outline-dark">
              {{ $t("commerce_agent.messages.component_not_rendered", { component: component.component }) }}
            </VcAlert>
          </template>

          <VcAlert v-if="turn.error" color="danger" size="sm" variant="solid-light">
            {{ $t("commerce_agent.messages.turn_failed") }}
          </VcAlert>
        </template>
      </li>
    </ol>

    <!-- Streamed text arrives in fragments, so the region announces the settled reply, not each delta. -->
    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>

    <form class="agent-conversation__composer" @submit.prevent="send">
      <VcInput
        v-model="draft"
        :placeholder="$t('commerce_agent.labels.ask')"
        :disabled="!isReady || isAnswering"
        :aria-label="$t('commerce_agent.labels.ask')"
        autocomplete="off"
        maxlength="4000"
      />

      <VcButton type="submit" :disabled="!isReady || !draft.trim()" :loading="isAnswering">
        {{ $t("commerce_agent.labels.send") }}
      </VcButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useCommerceAgent } from "../composables/useCommerceAgent";
import AgentProducts from "./agent-products.vue";
import AgentSuggestions from "./agent-suggestions.vue";
import type { IAgentProductsPayload, IAgentSuggestionsPayload } from "../types";

const { turns, isReady, isAnswering, ask } = useCommerceAgent();

const draft = ref("");
const transcript = ref<HTMLElement>();

const announcement = computed(() => {
  if (isAnswering.value) {
    return "";
  }

  const last = turns.value[turns.value.length - 1];

  return last?.role === "assistant" ? last.text : "";
});

watch(
  () => turns.value.length,
  async () => {
    await nextTick();
    transcript.value?.scrollTo({ top: transcript.value.scrollHeight });
  },
);

async function send() {
  const message = draft.value;
  draft.value = "";
  await ask(message);
}
</script>

<style lang="scss">
.agent-conversation {
  @apply flex flex-col gap-4;

  &__turns {
    @apply flex max-h-[60vh] flex-col gap-5 overflow-y-auto;
  }

  &__turn {
    @apply flex flex-col gap-3;
  }

  &__asked {
    @apply font-bold;
  }

  &__said {
    @apply whitespace-pre-wrap;
  }

  &__steps {
    @apply flex flex-col gap-1 text-xs text-neutral-500;
  }

  &__step {
    @apply flex items-center gap-1.5;

    &::before {
      @apply size-1.5 shrink-0 animate-pulse rounded-full bg-neutral-400 content-[""];
    }

    &--done::before {
      @apply animate-none bg-success-500;
    }

    &--failed::before {
      @apply animate-none bg-danger-500;
    }
  }

  &__composer {
    @apply flex items-start gap-2;

    > *:first-child {
      @apply grow;
    }
  }
}
</style>
