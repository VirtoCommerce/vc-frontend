import { Controls, Description, DocsContext, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import { createElement, useContext } from "react";
import deprecatedJson from "./generated/deprecated-components.json";

const deprecatedComponents = new Map<string, string>(Object.entries(deprecatedJson));

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
  const context = useContext<typeof DocsContext>(DocsContext);
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
