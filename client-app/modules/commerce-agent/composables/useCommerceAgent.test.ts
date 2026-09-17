import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, watch } from "vue";
import { useCommerceAgent } from "./useCommerceAgent";
import type { IAgentEvent } from "../types";

const startAgentSession = vi.fn();
const streamAgentTurn = vi.fn();

vi.mock("../api/agent-api", () => ({
  startAgentSession: (...args: unknown[]) => startAgentSession(...args),
  streamAgentTurn: (...args: unknown[]) => streamAgentTurn(...args),
}));

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ headers: computed(() => ({ Authorization: "Bearer t" })) }),
}));

function answerWith(...events: IAgentEvent[]) {
  streamAgentTurn.mockImplementation(
    (_sessionId: string, _authorization: string, _message: string, onEvent: (event: IAgentEvent) => void) => {
      events.forEach(onEvent);
      return Promise.resolve();
    },
  );
}

describe("useCommerceAgent", () => {
  beforeEach(async () => {
    useCommerceAgent().reset();
    startAgentSession.mockResolvedValue({ sessionId: "s-1", name: "Ivan" });
    await useCommerceAgent().start();
  });

  it("publishes the cart the agent wrote, so the storefront can refresh its own", async () => {
    const { ask, cart } = useCommerceAgent();
    answerWith({
      type: "cart_update",
      data: { cart: { items: [], item_count: 2, subtotal: 388.8, currency: "USD" } },
    });

    await ask("add the galvanized bolts");

    expect(cart.value?.item_count).toBe(2);
  });

  it("leaves the cart alone on a turn that only reads", async () => {
    const { ask, cart } = useCommerceAgent();
    answerWith({ type: "text_delta", data: { text: "here you go" } });

    await ask("what carriage bolts do you have?");

    expect(cart.value).toBeUndefined();
  });

  it("shows each text delta as it arrives instead of the whole reply at the end", async () => {
    const { ask, turns } = useCommerceAgent();
    const rendered: string[] = [];
    const stop = watch(
      () => turns.value.at(-1)?.text,
      (text) => rendered.push(String(text ?? "")),
      {
        flush: "sync",
      },
    );

    streamAgentTurn.mockImplementation(
      async (_s: string, _a: string, _m: string, onEvent: (event: IAgentEvent) => void) => {
        for (const text of ["Here ", "are the ", "bolts"]) {
          onEvent({ type: "text_delta", data: { text } });
          await nextTick();
        }
      },
    );

    await ask("what bolts do you have?");
    stop();

    expect(rendered).toContain("Here ");
    expect(rendered).toContain("Here are the ");
    expect(rendered.at(-1)).toBe("Here are the bolts");
  });

  it("shows what the agent is doing while it does it, and marks each step settled", async () => {
    const { ask, turns } = useCommerceAgent();
    answerWith(
      { type: "tool_call", data: { tool: "search_products", id: "t1", label: "Looking for canned drinks" } },
      { type: "tool_result", data: { tool: "search_products", id: "t1", is_error: false } },
      { type: "tool_call", data: { tool: "search_products", id: "t2", label: "Broadening the search" } },
      { type: "tool_result", data: { tool: "search_products", id: "t2", is_error: true } },
    );

    await ask("we need canned drinks for the office");

    expect(turns.value.at(-1)?.steps).toEqual([
      { id: "t1", label: "Looking for canned drinks", done: true, failed: false },
      { id: "t2", label: "Broadening the search", done: true, failed: true },
    ]);
  });

  it("never shows a tool call the model gave no words for", async () => {
    const { ask, turns } = useCommerceAgent();
    answerWith({ type: "tool_call", data: { tool: "get_cart", id: "t1", input: { cart_id: "c-1" } } });

    await ask("what is in my cart?");

    expect(turns.value.at(-1)?.steps).toEqual([]);
  });

  it("keeps rendering a turn whose stream carries an event it does not know", async () => {
    const { ask, turns } = useCommerceAgent();
    answerWith({ type: "progress", data: { label: "searching" } }, { type: "text_delta", data: { text: "done" } });

    await ask("hi");

    expect(turns.value.at(-1)?.text).toBe("done");
  });
});
