import { createGlobalState } from "@vueuse/core";
import { computed, readonly, ref, shallowRef } from "vue";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { startAgentSession, streamAgentTurn } from "../api/agent-api";
import type { IAgentCart, IAgentComponent, IAgentEvent, IAgentTurn } from "../types";
import type { Ref } from "vue";

function _useCommerceAgent() {
  const { headers } = useAuth();

  const sessionId = ref<string>();
  const greeting = ref<string>();
  const turns = ref<IAgentTurn[]>([]) as Ref<IAgentTurn[]>;
  const cart = ref<IAgentCart>();
  const isStarting = ref(false);
  const isAnswering = ref(false);
  const failure = ref<string>();
  const abort = shallowRef<AbortController>();

  const isReady = computed(() => !!sessionId.value);

  async function start(): Promise<void> {
    if (sessionId.value || isStarting.value) {
      return;
    }

    const authorization = headers.value.Authorization;

    if (!authorization) {
      failure.value = "not_signed_in";
      return;
    }

    isStarting.value = true;
    failure.value = undefined;

    try {
      const session = await startAgentSession(authorization);
      sessionId.value = session.sessionId;
      greeting.value = session.name;
    } catch (error) {
      Logger.error("commerce-agent: could not start a session", error);
      failure.value = "unavailable";
    } finally {
      isStarting.value = false;
    }
  }

  async function ask(message: string): Promise<void> {
    const trimmed = message.trim();
    // Read at call time, not at session start: the storefront refreshes on its own
    // schedule and the turn must go out under whatever token is current now.
    const authorization = headers.value.Authorization;

    if (!trimmed || !sessionId.value || !authorization || isAnswering.value) {
      return;
    }

    turns.value.push({ role: "user", text: trimmed, components: [] });
    turns.value.push({ role: "assistant", text: "", components: [] });

    // The reactive proxy the array handed back, not the object literal pushed into it:
    // mutating the raw object skips the proxy, so nothing re-renders until the turn ends
    // and the reply lands on screen in one piece instead of streaming.
    const reply = turns.value[turns.value.length - 1];

    isAnswering.value = true;
    abort.value = new AbortController();

    try {
      await streamAgentTurn(
        sessionId.value,
        authorization,
        trimmed,
        (event) => apply(reply, event),
        abort.value.signal,
      );
    } catch (error) {
      if (!abort.value.signal.aborted) {
        Logger.error("commerce-agent: the turn failed", error);
        reply.error = "unavailable";
      }
    } finally {
      isAnswering.value = false;
      abort.value = undefined;
    }
  }

  function apply(reply: IAgentTurn, event: IAgentEvent): void {
    switch (event.type) {
      case "text_delta":
        reply.text += String(event.data.text ?? "");
        break;

      case "ui":
        reply.components.push(event.data as unknown as IAgentComponent);
        break;

      case "cart_update":
        // The agent writes to the cart itself, so the storefront's own cart state is stale
        // from this moment. Replacing the ref is the signal consumers watch.
        cart.value = event.data.cart as IAgentCart;
        break;

      case "error":
        reply.error = String(event.data.message ?? "unavailable");
        break;
    }
  }

  function stop(): void {
    abort.value?.abort();
  }

  function reset(): void {
    stop();
    turns.value = [];
    cart.value = undefined;
    sessionId.value = undefined;
    failure.value = undefined;
  }

  return {
    turns: readonly(turns),
    greeting: readonly(greeting),
    cart: readonly(cart),
    isReady,
    isStarting: readonly(isStarting),
    isAnswering: readonly(isAnswering),
    failure: readonly(failure),

    start,
    ask,
    stop,
    reset,
  };
}

export const useCommerceAgent = createGlobalState(_useCommerceAgent);
