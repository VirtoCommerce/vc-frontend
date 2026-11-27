import { describe, expect, it } from "vitest";
import announcement from "../blocks/announcement.json";
import announcementBar from "./announcement-bar.json";

describe("announcement-bar schema", () => {
  it("seeds a new bar with an announcement showing the block's default text", () => {
    const text = announcement.settings.find((setting) => setting.id === "text");

    expect(announcementBar.default.blocks).toEqual([{ type: "announcement", text: text?.default }]);
    expect(announcementBar.blocks).toContain("announcement");
  });
});
