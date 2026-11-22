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
});
