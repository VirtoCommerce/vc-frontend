import { createElement } from "react";
import { addons } from "storybook/manager-api";
import deprecatedJson from "./generated/deprecated-components.json";

const DEPRECATED_COMPONENTS = new Set(Object.keys(deprecatedJson));

addons.setConfig({
  sidebar: {
    renderLabel(item) {
      if (!DEPRECATED_COMPONENTS.has(item.name)) {
        return createElement("span", null, item.name);
      }

      return createElement(
        "span",
        { style: { display: "inline-flex", alignItems: "center", gap: "6px" } },
        item.name,
        createElement(
          "span",
          {
            style: {
              fontSize: "9px",
              fontWeight: 600,
              background: "#78350f",
              color: "#fef3c7",
              padding: "1px 5px",
              borderRadius: "4px",
              lineHeight: "1.4",
            },
          },
          "deprecated",
        ),
      );
    },
  },
});
