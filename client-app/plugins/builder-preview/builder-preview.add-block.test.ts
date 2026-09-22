import { expect, it, vi } from "vitest";
import type { IPageTemplate } from "@/shared/static-content/types";
import type { App } from "vue";
import type { Router } from "vue-router";

const { preview, updateOverlay } = vi.hoisted(() => ({
  preview: { value: undefined as IPageTemplate | undefined },
  updateOverlay: vi.fn(),
}));

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: {}, setGlobals: vi.fn() }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: preview }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: {} }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: {} }));
vi.mock("./utils", () => ({ getBuilderOrigin: () => "https://builder.example" }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => ({}) }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {
    update = updateOverlay;
  },
}));

it("renders an Add-block model, preserves its source, and removes it on the next page update", async () => {
  const addListener = vi.spyOn(window, "addEventListener");
  try {
    const { default: plugin } = await import("./builder-preview.plugin");
    const router = {
      getRoutes: () => [{ name: "Matcher" }],
      removeRoute: vi.fn(),
      addRoute: vi.fn(),
      beforeEach: vi.fn(),
      push: vi.fn(),
    } as unknown as Router;
    await plugin.install({} as App, { router });
    const template = { settings: {}, content: [{ id: "saved-section", type: "text", text: "Saved text" }] };
    const model = { type: "text", text: "Hello, markdown!", heading: "h2" };
    const boundaries = [{ placementId: "placement-1", startIndex: 0, count: 1 }];
    const send = (type: string, previewModel?: typeof model & { id?: string }) =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://builder.example",
          source: window.parent,
          data: { source: "builder", type, template, model: previewModel, sharedComponentBoundaries: boundaries },
        }),
      );

    send("preview", model);

    await vi.waitFor(() => expect(preview.value?.content.some((block) => block.text === model.text)).toBe(true));
    const rendered = preview.value!.content.find((block) => block.text === model.text)!;
    expect(rendered.id).toEqual(expect.stringMatching(/^__preview__.+/));
    expect(preview.value!.content).toContainEqual({ type: "scroll-to", id: `__scroll__${rendered.id}` });
    expect(preview.value!.content).toContainEqual(template.content[0]);
    expect(updateOverlay).toHaveBeenLastCalledWith(["saved-section", rendered.id], boundaries);
    expect(model).not.toHaveProperty("id");
    expect(template.content).toHaveLength(1);

    send("preview", { ...model, id: "existing-preview" });
    await vi.waitFor(() => expect(preview.value!.content.some((block) => block.id === "existing-preview")).toBe(true));
    expect(preview.value!.content.some((block) => block.id === rendered.id)).toBe(false);

    send("page");
    await vi.waitFor(() => expect(preview.value!.content.some((block) => block.text === model.text)).toBe(false));
    expect(preview.value!.content).toContainEqual(template.content[0]);
    expect(updateOverlay).toHaveBeenLastCalledWith(["saved-section"], boundaries);
  } finally {
    for (const [type, listener] of addListener.mock.calls) {
      if (type === "message") {
        window.removeEventListener(type, listener);
      }
    }
    vi.restoreAllMocks();
    document.body.replaceChildren();
  }
});
