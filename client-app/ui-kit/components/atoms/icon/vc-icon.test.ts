import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import VcIcon from "./vc-icon.vue";

describe("VcIcon variant", () => {
  it("adds vc-icon--outline for an outline icon", async () => {
    const wrapper = mount(VcIcon, { props: { name: "credit-card" } });
    await flushPromises();
    expect(wrapper.classes()).toContain("vc-icon--outline");
  });

  it("does not add vc-icon--outline for a solid-only icon", async () => {
    const wrapper = mount(VcIcon, { props: { name: "outline-security" } });
    await flushPromises();
    expect(wrapper.classes()).not.toContain("vc-icon--outline");
  });

  it("forces solid rendering with variant='solid'", async () => {
    const wrapper = mount(VcIcon, { props: { name: "credit-card", variant: "solid" } });
    await flushPromises();
    expect(wrapper.classes()).not.toContain("vc-icon--outline");
  });
});

describe("VcIcon size", () => {
  const PRESETS = ["xxs", "xs", "sm", "lg", "xl", "xxl"];

  it("applies a size class for known presets", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", size: "sm" } });
    await flushPromises();
    expect(wrapper.classes()).toContain("vc-icon--size--sm");
    expect(wrapper.attributes("style") || "").not.toContain("width");
  });

  it("applies inline px for numeric size", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", size: 28 } });
    await flushPromises();
    expect(wrapper.attributes("style")).toContain("width: 28px");
    expect(wrapper.attributes("style")).toContain("height: 28px");
  });

  it("applies an arbitrary CSS length verbatim (no bogus class)", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", size: "1.25rem" } });
    await flushPromises();
    expect(wrapper.attributes("style")).toContain("width: 1.25rem");
    // eslint-disable-next-line sonarjs/null-dereference -- classes() returns string[]; the rule is a false positive here
    expect(wrapper.classes().some((c) => c.startsWith("vc-icon--size--"))).toBe(false);
  });

  it("applies auto verbatim", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", size: "auto" } });
    await flushPromises();
    expect(wrapper.attributes("style")).toContain("width: auto");
  });

  it.each(PRESETS)("has a size class for preset %s", async (preset) => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", size: preset } });
    await flushPromises();
    expect(wrapper.classes()).toContain(`vc-icon--size--${preset}`);
  });
});

describe("VcIcon outline stroke", () => {
  it("sets --vc-icon-stroke inline when strokeWidth prop is given", async () => {
    const wrapper = mount(VcIcon, { props: { name: "credit-card", strokeWidth: 2 } });
    await flushPromises();
    expect(wrapper.attributes("style")).toContain("--vc-icon-stroke: 2");
  });

  it("does not set --vc-icon-stroke when strokeWidth is absent", async () => {
    const wrapper = mount(VcIcon, { props: { name: "credit-card" } });
    await flushPromises();
    expect(wrapper.attributes("style") || "").not.toContain("--vc-icon-stroke");
  });
});

describe("VcIcon a11y", () => {
  it("is aria-hidden by default (decorative)", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap" } });
    await flushPromises();
    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
  });

  it("exposes role=img + aria-label when label is set", async () => {
    const wrapper = mount(VcIcon, { props: { name: "academic-cap", label: "Diploma" } });
    await flushPromises();
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe("Diploma");
  });
});
