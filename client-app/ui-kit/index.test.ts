import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "vue";
import { uiKit } from "@/ui-kit";

describe("uiKit", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("adds one popover host to body, however many apps install it", () => {
    createApp({}).use(uiKit);
    createApp({}).use(uiKit);

    expect(document.body.querySelectorAll(":scope > #popover-host")).toHaveLength(1);
  });

  it("adds the host once body exists when installed before it", () => {
    const body = document.body;
    body.remove();

    createApp({}).use(uiKit);
    document.documentElement.append(body);
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.body.querySelectorAll(":scope > #popover-host")).toHaveLength(1);
  });

  it("keeps a host the page already has", () => {
    const own = document.createElement("div");
    own.id = "popover-host";
    document.body.append(own);

    createApp({}).use(uiKit);

    expect([...document.querySelectorAll("#popover-host")]).toEqual([own]);
  });
});
