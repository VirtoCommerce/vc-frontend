import { beforeEach, describe, expect, it, vi } from "vitest";
import { startAgentSession, streamAgentTurn } from "./agent-api";
import type { IAgentEvent } from "../types";

function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}

function respondWith(stream: ReadableStream<Uint8Array>) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, body: stream }));
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<IAgentEvent[]> {
  respondWith(stream);

  const events: IAgentEvent[] = [];
  await streamAgentTurn("session-1", "Bearer t", "hello", (event) => events.push(event));

  return events;
}

describe("streamAgentTurn", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads one frame per event", async () => {
    const events = await collect(
      streamOf('event: text_delta\ndata: {"text":"hi"}\n\n', 'event: ui\ndata: {"component":"products"}\n\n'),
    );

    expect(events).toEqual([
      { type: "text_delta", data: { text: "hi" } },
      { type: "ui", data: { component: "products" } },
    ]);
  });

  it("reassembles a frame split across chunks", async () => {
    const events = await collect(streamOf("event: text_delta\nda", 'ta: {"text":"split"}\n\n'));

    expect(events).toEqual([{ type: "text_delta", data: { text: "split" } }]);
  });

  it("reads several frames arriving in one chunk", async () => {
    const events = await collect(
      streamOf('event: text_delta\ndata: {"text":"a"}\n\nevent: text_delta\ndata: {"text":"b"}\n\n'),
    );

    expect(events.map((event) => event.data.text)).toEqual(["a", "b"]);
  });

  it("ignores a trailing fragment that never completes", async () => {
    const events = await collect(streamOf('event: text_delta\ndata: {"text":"a"}\n\nevent: ui\ndata: {"comp'));

    expect(events).toHaveLength(1);
  });

  it("sends the session id and the bearer as headers, and neither in the body", async () => {
    respondWith(streamOf(""));

    await streamAgentTurn("session-1", "Bearer t", "hello", () => {});

    const [, request] = vi.mocked(fetch).mock.calls[0];
    const headers = request?.headers as Record<string, string>;
    expect(headers["X-Session-Id"]).toBe("session-1");
    expect(headers.Authorization).toBe("Bearer t");
    expect(request?.body).toBe(JSON.stringify({ message: "hello" }));
  });

  it("fails when the service answers without a stream", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, body: null }));

    await expect(streamAgentTurn("session-1", "Bearer t", "hello", () => {})).rejects.toThrow("503");
  });
});

describe("startAgentSession", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the session the service bound to the presented token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ session_id: "s-1", name: "Ivan", organization: "Contoso" }),
      }),
    );

    await expect(startAgentSession("Bearer t")).resolves.toEqual({
      sessionId: "s-1",
      name: "Ivan",
      organization: "Contoso",
    });
  });

  it("reports the service's reason when the token is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: "The access token was rejected" }),
      }),
    );

    await expect(startAgentSession("Bearer t")).rejects.toThrow("The access token was rejected");
  });
});
