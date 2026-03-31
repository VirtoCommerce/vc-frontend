import { Controls, Description, DocsContext, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import { createElement, useContext } from "react";
import atomsIndex from "../client-app/ui-kit/components/atoms/index.ts?raw";
import moleculesIndex from "../client-app/ui-kit/components/molecules/index.ts?raw";
import organismsIndex from "../client-app/ui-kit/components/organisms/index.ts?raw";

// Build a map of deprecated component names to their deprecation messages
export const deprecatedComponents = new Map<string, string>();
for (const source of [atomsIndex, moleculesIndex, organismsIndex]) {
  const lines = source.split(/\r?\n/);
  const deprecatedCommentRe = /\/\*\*\s*@deprecated\s+([^*]*)/;
  const exportLineRe = /export\s*\{[^}]*\bas\s+(\w+)/;

  for (let i = 0; i < lines.length; i += 1) {
    const commentLine = lines[i];
    const deprecatedMatch = deprecatedCommentRe.exec(commentLine);
    if (!deprecatedMatch) {
      continue;
    }

    const message = deprecatedMatch[1].trim();
    const exportLine = lines[i + 1] ?? "";
    const exportMatch = exportLineRe.exec(exportLine);

    if (exportMatch) {
      deprecatedComponents.set(exportMatch[1], message);
    }
  }
}

const bannerStyle = {
  background: "#78350f",
  color: "#fef3c7",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "14px",
  lineHeight: "1.5",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
};

function DeprecatedBanner() {
  const context = useContext(DocsContext);
  const story = context.storyById();
  const title = story?.title ?? "";
  const componentName = title.split("/").pop() || "";
  const message = deprecatedComponents.get(componentName);

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

export function DocsPage() {
  return createElement(
    "div",
    null,
    createElement(Title),
    createElement(DeprecatedBanner),
    createElement(Subtitle),
    createElement(Description),
    createElement(Primary),
    createElement(Controls),
    createElement(Stories),
  );
}
