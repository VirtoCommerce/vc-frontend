import { describe, expect, it } from "vitest";
import { compileTemplate } from "./template";
import type { IKit } from "./kit/registry";

const KIT: IKit = { tags: {}, behaviors: {} };

describe("compileTemplate", () => {
  it("keeps a template still in use while others come and go, so its section does not mount afresh", () => {
    const used = "<section>Used</section>";
    const first = compileTemplate(used, KIT);

    for (let index = 0; index < 31; index++) {
      compileTemplate(`<section>${index}</section>`, KIT);
    }
    compileTemplate(used, KIT);
    compileTemplate("<section>One more</section>", KIT);

    expect(compileTemplate(used, KIT)).toBe(first);
  });

  it("drops the template used least recently past 32, so it compiles afresh", () => {
    const dropped = "<section>Dropped</section>";
    const first = compileTemplate(dropped, KIT);

    for (let index = 0; index < 32; index++) {
      compileTemplate(`<section>Filler ${index}</section>`, KIT);
    }

    expect(compileTemplate(dropped, KIT)).not.toBe(first);
  });

  it("keeps an attribute whose value reads like the end of a comment or a markup declaration, as the server does", () => {
    const compiled = compileTemplate(
      '<section><a href="/next" aria-label="Next -->" title="a ]> b">x</a></section>',
      KIT,
    );
    const [link] = compiled?.root.children ?? [];

    expect(link && "attributes" in link ? link.attributes : []).toEqual([
      ["href", ["/next"]],
      ["aria-label", ["Next -->"]],
      ["title", ["a ]> b"]],
    ]);
  });

  it("keeps markup written in an attribute value as its text, never as elements", () => {
    const compiled = compileTemplate('<section><p title="</style><img src=x onerror=alert(1)>">x</p></section>', KIT);
    const [paragraph] = compiled?.root.children ?? [];

    expect(paragraph && "attributes" in paragraph ? paragraph.attributes : []).toEqual([
      ["title", ["</style><img src=x onerror=alert(1)>"]],
    ]);
    expect(paragraph && "children" in paragraph ? paragraph.children : []).toEqual([{ text: ["x"] }]);
  });
});
