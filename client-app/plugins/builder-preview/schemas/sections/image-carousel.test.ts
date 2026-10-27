import { describe, it, expect } from "vitest";
import schema from "./image-carousel.json";

describe("image-carousel section schema", () => {
  it("lets the page builder pick several images", () => {
    const imagesSetting = schema.settings.find((setting) => setting.id === "images");

    expect(imagesSetting).toMatchObject({ type: "images", multiple: true });
  });
});
