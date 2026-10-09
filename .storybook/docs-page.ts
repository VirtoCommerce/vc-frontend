import { Controls, Description, DocsContext, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import { createElement, useContext } from "react";
import { darkPresets } from "../client-app/assets/presets";

const bannerStyle = {
  background: "#FFCA7A",
  color: "#3D2500",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "14px",
  lineHeight: "1.5",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
};

function DeprecatedBanner() {
  const context = useContext<typeof DocsContext>(DocsContext);
  const story = context.storyById();
  const message = story?.parameters?.deprecated ?? "";

  if (!message) {
    return null;
  }

  return createElement(
    "div",
    { style: bannerStyle },
    createElement("strong", null, "\u26A0 Deprecated"),
    createElement("br"),
    message,
  );
}

function DarkPresetMissingBanner() {
  const context = useContext<typeof DocsContext>(DocsContext);
  const story = context.storyById();
  const storyContext = context.getStoryContext(story);
  const darkMode = storyContext.globals.darkMode as "light" | "dark" | "system" | undefined;
  const themePreset = storyContext.globals.themePreset as string | undefined;

  const isDark =
    darkMode === "dark" || (darkMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const hasDarkPreset = !!themePreset && themePreset in darkPresets;

  if (!isDark || hasDarkPreset) {
    return null;
  }

  return createElement(
    "div",
    { style: bannerStyle },
    createElement("strong", null, "⚠ Dark preset missing"),
    createElement("br"),
    `Preset "${themePreset}" has no dark variant.`,
  );
}

export function DocsPage() {
  return createElement(
    "div",
    null,
    createElement(Title),
    createElement(DeprecatedBanner),
    createElement(DarkPresetMissingBanner),
    createElement(Subtitle),
    createElement(Description),
    createElement(Primary),
    createElement(Controls),
    createElement(Stories),
  );
}
