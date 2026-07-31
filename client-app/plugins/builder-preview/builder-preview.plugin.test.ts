import { afterEach, describe, expect, it, vi } from "vitest";
import { addBuilderMessageListener, createPreviewLoadedNotifier, isBuilderMessage } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";

const validTemplate = {
  settings: {},
  content: [{ id: "section-1", type: "text-block" }],
};

const messageDisposers: Array<() => void> = [];

describe("Page Builder preview message protocol", () => {
  afterEach(() => {
    messageDisposers.splice(0).forEach((dispose) => dispose());
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it.each(["changed", "update", "remove", "add", "reload", "page", "swap", "preview"])(
    "accepts a valid %s preview update",
    (type) => {
      expect(
        isBuilderMessage({
          source: "builder",
          type,
          template: validTemplate,
          sectionId: "section-1",
          linkedComponentBoundaries: [],
        }),
      ).toBe(true);
    },
  );

  it("accepts an empty optional selection in a preview update", () => {
    expect(
      isBuilderMessage({
        source: "builder",
        type: "page",
        template: validTemplate,
        sectionId: "",
      }),
    ).toBe(true);
  });

  it.each([
    { source: "builder", type: "connect" },
    { source: "builder", type: "hover", sectionId: null },
    { source: "builder", type: "hover", sectionId: "placement-1" },
    { source: "builder", type: "select", sectionId: "placement-1" },
    { source: "builder", type: "navigate", url: "/summer" },
    { source: "builder", type: "settings", settings: { color_success_600: "#008000" } },
    { source: "builder", type: "auth", token: null, userId: null },
    { source: "builder", type: "auth", token: { access_token: "token" }, userId: "user-1" },
  ])("accepts a valid non-template message: $type", (message) => {
    expect(isBuilderMessage(message)).toBe(true);
  });

  it.each([
    null,
    [],
    { source: "preview", type: "select", sectionId: "placement-1" },
    { source: "builder", type: "unknown" },
    { source: "builder", type: "page", template: 42 },
    { source: "builder", type: "page", template: { settings: {}, content: {} } },
    { source: "builder", type: "page", template: validTemplate, sectionId: 42 },
    { source: "builder", type: "page", template: validTemplate, sectionId: "   " },
    { source: "builder", type: "page", template: validTemplate, linkedComponentBoundaries: {} },
    { source: "builder", type: "hover" },
    { source: "builder", type: "hover", sectionId: 42 },
    { source: "builder", type: "select", sectionId: null },
    { source: "builder", type: "select", sectionId: "  " },
    { source: "builder", type: "navigate", url: 42 },
    { source: "builder", type: "settings", settings: [] },
    { source: "builder", type: "auth", token: 42, userId: "user-1" },
    { source: "builder", type: "auth", token: { access_token: 42 }, userId: "user-1" },
    { source: "builder", type: "auth", token: null },
  ])("rejects malformed input %#", (message) => {
    expect(isBuilderMessage(message)).toBe(false);
  });

  it("accepts messages only from the configured origin and parent window", () => {
    const onMessage = vi.fn();
    const dispose = addBuilderMessageListener(window, "https://builder.example", window, onMessage);
    messageDisposers.push(dispose);
    const validMessage = { source: "builder", type: "select", sectionId: "placement-1" };
    const otherFrame = document.createElement("iframe");
    document.body.appendChild(otherFrame);

    dispatchMessage("https://other.example", window, validMessage);
    dispatchMessage("https://builder.example", otherFrame.contentWindow, validMessage);
    dispatchMessage("https://builder.example", window, { ...validMessage, sectionId: 42 });
    dispatchMessage("https://builder.example", window, validMessage);

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage).toHaveBeenCalledWith(validMessage);

    dispose();
    otherFrame.remove();
    dispatchMessage("https://builder.example", window, validMessage);
    expect(onMessage).toHaveBeenCalledOnce();
  });

  it("delivers a page update with an empty optional selection", () => {
    const onMessage = vi.fn();
    const dispose = addBuilderMessageListener(window, "https://builder.example", window, onMessage);
    messageDisposers.push(dispose);
    const message = {
      source: "builder",
      type: "page",
      template: validTemplate,
      sectionId: "",
      linkedComponentBoundaries: [],
    };

    dispatchMessage("https://builder.example", window, message);

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage).toHaveBeenCalledWith(message);
    dispose();
  });

  it("announces readiness after schemas load and again when the builder reconnects", () => {
    const targetWindow = { postMessage: vi.fn() } as unknown as Window;
    const schemas: PageBuilderSchemaType = {
      blocks: {},
      sections: { image: { type: "image" } },
      shared: {},
      objects: {},
      templates: {},
      settingsSchema: {},
    };
    const notifier = createPreviewLoadedNotifier(targetWindow, "https://builder.example");

    notifier.announce();
    expect(targetWindow.postMessage).not.toHaveBeenCalled();

    notifier.setData(schemas);
    expect(targetWindow.postMessage).toHaveBeenCalledWith(
      { source: "preview", type: "loaded", data: schemas },
      "https://builder.example",
    );

    vi.mocked(targetWindow.postMessage).mockClear();
    notifier.announce();
    expect(targetWindow.postMessage).toHaveBeenCalledWith(
      { source: "preview", type: "loaded", data: schemas },
      "https://builder.example",
    );
  });
});

function dispatchMessage(origin: string, source: MessageEventSource | null, data: unknown): void {
  window.dispatchEvent(new MessageEvent("message", { origin, source, data }));
}
