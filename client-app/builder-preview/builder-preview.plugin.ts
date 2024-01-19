import { useFetch } from "@/core/composables";
import { useStaticPage, useTemplate } from "@/shared/static-content";
import { templateBlocks } from "@/shared/static-content/components";
import ScrollToElement from "./scroll-to-element.vue";
import type { IThemeConfig } from "@/core/types";
import type { PageContent, PageTemplate } from "@/shared/static-content/types";
import type { App } from "vue";
import type { Router } from "vue-router";
import StaticPage from "@/pages/static-page.vue";

const { enrichRequest } = useFetch();

templateBlocks["scroll-to"] = ScrollToElement;

enrichRequest((headers: Headers) => {
  headers.append("x-template-builder", "preview-mode");
  return headers;
});

declare type TransferDataType = {
  template: PageTemplate;
  model: PageContent;
  templateKey?: string;
  source?: string;
  type?: string;
  sectionId?: string;
  url?: string;
  settings?: IThemeConfig;
};

async function updatePreview(data: TransferDataType, options: { router: Router }) {
  const template = data.template;
  if (data.model) {
    template.content.push(data.model);
  }

  const newTemplate = { ...template, content: <PageContent[]>[] };

  template.content.forEach((block: PageContent) => {
    newTemplate.content.push({ type: "scroll-to", id: "__scroll__" + block.id });
    newTemplate.content.push(block);
  });

  if (!data.templateKey) {
    if (templateUrl) {
      await options.router.push("/designer-preview");
    }
    useStaticPage(newTemplate, true);
  } else {
    if (templateUrl) {
      await options.router.push(templateUrl);
    }
    useTemplate(data.templateKey, newTemplate);
  }
  templateUrl = undefined;
}

function updateSettings(app: App, settings: IThemeConfig) {
  const keys = Object.entries(settings);

  keys.forEach(([key, value]) => {
    (app.config.globalProperties.$cfg as Record<string, unknown>)[key] = value;
  });

  keys
    .filter(([key]) => /^color/.test(key))
    .forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, value as string);
    });
}

export function measureElement(element: HTMLElement): {
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

  const moonwalk = function (_parent: HTMLElement | null) {
    if (_parent) {
      gleft += _parent.offsetLeft;
      gtop += _parent.offsetTop;
      moonwalk(<HTMLElement>_parent.offsetParent);
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
  moonwalk(<HTMLElement>target.offsetParent);
  return rect;
}

let templateUrl: string | undefined;

// eslint-disable-next-line no-restricted-exports
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

    window.addEventListener("message", async (event: MessageEvent<TransferDataType>) => {
      if (event.origin !== document.location.origin || event.data.source !== "builder") {
        // note: it can be cause of some problems. investigate it.
        // eslint-disable-next-line no-console
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
          await updatePreview(event.data, options);
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
          // we will know about template it or not in the next message
          templateUrl = event.data.url;
          break;
        }
        case "settings":
          updateSettings(app, event.data.settings!);
          break;
      }
    });
    const page = <PageTemplate>(<unknown>{ settings: {}, content: [] });
    useStaticPage(page, true);
    const routes = options.router.getRoutes();
    const matcher = routes.find((x) => x.name === "Matcher")!;
    options.router.removeRoute("Matcher");
    options.router.addRoute({ path: "/designer-preview", name: "StaticPage", component: StaticPage, props: true });
    options.router.addRoute(matcher);
    window.parent.postMessage({ source: "preview", type: "loaded" }, window.location.origin);
  },
};
