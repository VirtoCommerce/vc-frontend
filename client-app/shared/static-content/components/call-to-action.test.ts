import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CallToAction from "./call-to-action.vue";

const VcButtonStub = { props: ["to", "externalLink"], template: "<button><slot /></button>" };

function mountButton(link: string) {
  return mount(CallToAction, {
    props: { buttons: [{ label: "Go", link }] },
    global: { stubs: { VcButton: VcButtonStub, VcImage: true } },
  }).findComponent(VcButtonStub);
}

describe("CallToAction", () => {
  it("links a button to a relative and an external URL", () => {
    expect(mountButton("/catalog").props("to")).toBe("/catalog");
    expect(mountButton("https://example.com").props("externalLink")).toBe("https://example.com");
  });

  it.each(["javascript:alert(1)", "data:text/html,<p>x</p>"])("renders a button without a link for %j", (link) => {
    const button = mountButton(link);

    expect(button.props("to")).toBeUndefined();
    expect(button.props("externalLink")).toBeUndefined();
  });
});
