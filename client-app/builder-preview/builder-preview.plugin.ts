import { useFetch } from "@/core/composables";
import { useStaticPage, useTemplate } from "@/shared/static-content";
import templateBlocks from "@/shared/static-content/components";
import ScrollToElement from "./scroll-to-element.vue";
import type { App } from "vue";
import type { Router } from "vue-router";

const { enrichRequest } = useFetch();

templateBlocks["scroll-to"] = ScrollToElement;

enrichRequest((headers: Headers) => {
  headers.append("x-template-builder", "preview-mode");
  return headers;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updatePreview(data: any) {
  const template = data.template;
  if (data.model) {
    template.content.push(data.model);
  }

  const newTemplate = { ...template, content: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template.content.forEach((block: any) => {
    newTemplate.content.push({ type: "scroll-to", id: "__scroll__" + block.id });
    newTemplate.content.push(block);
  });

  if (!data.templateKey) {
    useStaticPage(newTemplate);
  } else {
    useTemplate(data.templateKey, newTemplate);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateSettings(app: App, settings: any) {
  const keys = Object.entries(settings);

  keys.forEach(([key, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app.config.globalProperties.$cfg as Record<string, any>)[key] = value;
  });

  keys
    .filter(([key]) => /^color/.test(key))
    .forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, value as string);
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function measureElement(element: any): {
  top?: number;
  left?: number;
  height?: number;
  width?: number;
} {
  const target = element;
  const target_width = target.offsetWidth;
  const target_height = target.offsetHeight;
  let rect = {};
  let gleft = 0;
  let gtop = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moonwalk = function (_parent: any) {
    if (_parent) {
      gleft += _parent.offsetLeft;
      gtop += _parent.offsetTop;
      moonwalk(_parent.offsetParent);
    } else {
      rect = {
        top: target.offsetTop + gtop,
        left: target.offsetLeft + gleft,
        height: target_height,
        width: target_width,
      };
      return rect;
    }
  };
  moonwalk(target.offsetParent);
  return rect;
}

export default {
  install: (app: App, options: { router: Router }) => {
    const bodyEl = document.getElementsByTagName("body").item(0);

    if (bodyEl) {
      bodyEl.style.visibility = "hidden";
      bodyEl.style.position = "relative";
      const interactiveBlocker = document.createElement("div");
      interactiveBlocker.style.position = "absolute";
      interactiveBlocker.style.top = "0";
      interactiveBlocker.style.left = "0";
      interactiveBlocker.style.bottom = "0";
      interactiveBlocker.style.right = "0";
      bodyEl.appendChild(interactiveBlocker);
    }

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin !== document.location.origin || event.data.source !== "builder") {
        // note: it can be cause of some problems. investigate it.
        console.log("cancel message");
        return;
      }

      if (bodyEl) {
        bodyEl.style.visibility = "visible";
      }

      switch (event.data.type) {
        case "changed":
        case "page":
        case "preview":
          updatePreview(event.data);
          break;

        case "select": {
          const element = document.getElementById("__scroll__" + event.data.sectionId);
          if (element) {
            const rect = measureElement(element);
            const targetPosition = (rect.top || 0) - window.innerHeight / 10;
            window.scroll({
              top: targetPosition,
              behavior: "smooth",
            });
          }
          break;
        }
        case "navigate": {
          const url = event.data.url?.startsWith("/") ? event.data.url : "/" + event.data.url;
          options.router.push(url);
          break;
        }
        case "settings":
          updateSettings(app, event.data.settings);
          break;
      }
    });
    options.router.push("/");
    window.parent.postMessage({ source: "preview", type: "loaded" }, window.location.origin);
  },
};
