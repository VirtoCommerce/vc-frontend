import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { applyContributions, resetDeclaredSlots } from "@/core/federation/contributions/declare";
import { resetPluginStatuses, setPluginStatus } from "@/core/federation/contributions/status";
import { extensionPointsPlugin } from "./extension-points.plugin";
import type { Product } from "@/core/api/graphql/types";
import type { SlotPolicyType } from "@/core/federation/contributions/types";

const product = {} as Product;
const context = { setting: () => true, themeSetting: () => undefined, isAuthenticated: true, can: () => true };

function installedCanRender() {
  const app = createApp({});
  app.use(extensionPointsPlugin);
  return app.config.globalProperties.$canRenderExtensionPoint;
}

function declareCardButton(policy: SlotPolicyType): void {
  setPluginStatus("p", "pending");
  applyContributions(
    "p",
    { format: 1, slots: [{ at: "productCard/card-button", policy }] },
    context,
    createRouter({ history: createMemoryHistory(), routes: [] }),
  );
}

describe("$canRenderExtensionPoint", () => {
  beforeEach(() => {
    resetPluginStatuses();
    resetDeclaredSlots();
  });

  it("lets a slot render while its declaring plugin is on the way, before anything is registered", () => {
    declareCardButton("reserve");

    expect(installedCanRender()("productCard", "card-button", product)).toBe(true);
  });

  it("stops once the declaring plugin failed without registering", () => {
    declareCardButton("reserve");
    const canRender = installedCanRender();

    setPluginStatus("p", "failed");

    expect(canRender("productCard", "card-button", product)).toBe(false);
  });

  it("does not for a `none` declaration", () => {
    declareCardButton("none");

    expect(installedCanRender()("productCard", "card-button", product)).toBe(false);
  });
});
