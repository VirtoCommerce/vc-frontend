import { describe, expect, it } from "vitest";
import { registerBuiltInKit } from "./kit";
import { getCustomSectionKit } from "./kit";
import { renderCustomSection } from "./render";
import { compileTemplate } from "./template";
import type { ICompiledTemplate } from "./template";
import type { VNode } from "vue";

describe("renderCustomSection", () => {
  it("gives siblings with the same behaviors keys of their own", () => {
    registerBuiltInKit();
    const template = compileTemplate(
      '<section><p data-inview="">a</p><p data-inview="">b</p></section>',
      getCustomSectionKit(),
    ) as ICompiledTemplate;

    const root = renderCustomSection(template, { type: "custom-x", settings: {}, fields: [] });
    const keys = (root?.children as VNode[]).map((child) => child.key);

    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(2);
  });
});
