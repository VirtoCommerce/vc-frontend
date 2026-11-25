import { describe, expect, it, vi } from "vitest";
import { getCustomSectionKit, registerBuiltInKit } from "./kit";
import { renderCustomSection } from "./render";
import { compileTemplate } from "./template";
import type { ICompiledTemplate } from "./template";
import type { IThemeSchemaField } from "@/core/theme-snapshot";
import type { VNode } from "vue";

const purify = vi.hoisted(() => ({ calls: 0 }));

vi.mock("dompurify", async (importOriginal) => {
  const actual = (await importOriginal<typeof import("dompurify")>()).default;
  const create = (...args: Parameters<typeof actual>) => {
    const instance = actual(...args);
    const sanitize = instance.sanitize.bind(instance);
    instance.sanitize = ((...sanitizeArgs: Parameters<typeof sanitize>) => {
      purify.calls++;
      return sanitize(...sanitizeArgs);
    }) as typeof instance.sanitize;
    return instance;
  };

  return { default: Object.assign(create, actual) };
});

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

  it("reads each row's rich text once in a render, however many rows there are", () => {
    const fields: IThemeSchemaField[] = [{ id: "rows", type: "list", element: [{ id: "body", type: "text" }] }];
    const rows = Array.from({ length: 70 }, (_, index) => ({ body: `<p>Row ${index}</p>` }));
    const template = compileTemplate(
      '<section><div data-each="settings.rows" data-html="item.body"></div></section>',
      getCustomSectionKit(),
    ) as ICompiledTemplate;
    purify.calls = 0;

    renderCustomSection(template, { type: "custom-x", settings: { rows }, fields });

    expect(purify.calls).toBe(70);
  });
});
