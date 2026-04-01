import { useGlobalInterceptors } from "@/core/api/common";
import { Logger } from "@/core/utilities";
import { useStaticPage } from "@/shared/static-content";
import { templateBlocks } from "@/shared/static-content/components";
import PreviewPage from "./components/preview-page.vue";
import ScrollToElement from "./components/scroll-to-element.vue";
import { getRegisteredComponents } from "./register-components";
import { getBuilderOrigin, getPreviewPageId } from "./utils";
import type { PageBuilderPluginOptionsType } from "./models/PageBuilderPluginOptionsType";
import type { IThemeConfig } from "@/core/types";
import type { IPageContent, IPageTemplate } from "@/shared/static-content/types";
import type { App } from "vue";
import type { Router } from "vue-router";
import StaticPage from "@/pages/static-page.vue";

templateBlocks["scroll-to"] = ScrollToElement;

const { staticPagePreview } = useStaticPage();

declare type TransferDataType = {
  template: IPageTemplate;
  model: IPageContent;
  templateKey?: string;
  source?: string;
  type?: string;
  sectionId?: string;
  url?: string;
  settings?: IThemeConfig;
};

function scrollToSection(sectionId: string) {
  requestAnimationFrame(() => {
    const element = document.getElementById("__scroll__" + sectionId);
    if (element) {
      const rect = measureElement(element);
      const targetPosition = (rect.top || 0) - window.innerHeight / 10;
      window.scroll({ top: targetPosition, behavior: "smooth" });
    }
  });
}

async function updatePreview(data: TransferDataType, options: { router: Router }) {
  const template = data.template;
  if (data.model) {
    template.content.push(data.model);
  }

  const newTemplate = { ...template, content: <IPageContent[]>[] };

  template.content.forEach((block: IPageContent) => {
    newTemplate.content.push({ type: "scroll-to", id: "__scroll__" + block.id }, block);
  });

  if (!data.templateKey) {
    if (templateUrl) {
      await options.router.push("/designer-preview");
    }
    staticPagePreview.value = newTemplate;
  } else if (templateUrl) {
    await options.router.push(templateUrl);
  }
  templateUrl = undefined;

  // Remember the initially selected section for scroll restoration after auth changes
  if (data.sectionId) {
    initialSectionId = data.sectionId;
  }

  if (pendingScrollRestore) {
    pendingScrollRestore = false;
    if (initialSectionId) {
      scrollToSection(initialSectionId);
    }
  } else if (data.type === "page" && initialSectionId) {
    scrollToSection(initialSectionId);
  }
}

function updateSettings(app: App, settings: IThemeConfig) {
  const keys = Object.entries(settings);

  keys.forEach(([key, value]) => {
    (app.config.globalProperties.$cfg as Record<string, unknown>)[key] = value;
  });

  keys
    .filter(([key]) => key.startsWith("color"))
    .forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key.replaceAll('_', "-")}`, value as string);
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
let previewToken: string | null | undefined;
let pendingScrollRestore = false;
let initialSectionId: string | undefined;

function modifyRequests() {
  const { onRequest } = useGlobalInterceptors();

  onRequest.value.push((_, init) => {
    if (!init) {
      return;
    }
    if (!init.headers) {
      init.headers = {};
    }
    Object.assign(init.headers, { ["x-template-builder"]: "preview-mode" });

    if (previewToken) {
      Object.assign(init.headers, { Authorization: `Bearer ${previewToken}` });
    } else if (previewToken === null) {
      delete (init.headers as Record<string, string>).Authorization;
    }
  });
}

function createOverlay() {
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

  return bodyEl;
}

function handleMessages(app: App, options: PageBuilderPluginOptionsType, bodyEl: HTMLElement | null) {
  const builderOrigin = getBuilderOrigin();
  window.addEventListener("message", async (event: MessageEvent<TransferDataType>) => {
    if (event.origin !== builderOrigin || event.data.source !== "builder") {
      return;
    }

    if (bodyEl) {
      bodyEl.style.visibility = "visible";
    }

    switch (event.data.type) {
      case "changed":
      case "update":
      case "remove":
      case "add":
      case "reload":
      case "page":
      case "swap":
      case "preview":
        await updatePreview(event.data, options);
        break;

      case "hover":
        // ignore now
        break;
      case "select":
        scrollToSection(event.data.sectionId!);
        break;
      case "navigate": {
        // we will know about template it or not in the next message
        templateUrl = event.data.url;
        break;
      }
      case "settings":
        updateSettings(app, event.data.settings!);
        break;
      case "auth": {
        const tokenData = (event.data as Record<string, unknown>).token as
          | {
              access_token?: string;
            }
          | null
          | undefined;
        previewToken = tokenData?.access_token ?? null;
        // Force remount of all blocks with new token and restore scroll afterward
        pendingScrollRestore = true;
        staticPagePreview.value = undefined;
        break;
      }
      default:
        Logger.warn(`Unknown message type: ${event.data.type}`);
    }
  });
}

function modifyRoutes(router: Router, mode: "preview" | "designer") {
  if (mode === "designer") {
    const page = <IPageTemplate>(<unknown>{ settings: {}, content: [] });
    staticPagePreview.value = page;
  }
  const routes = router.getRoutes();
  const matcher = routes.find((x) => x.name === "Matcher")!;
  router.removeRoute("Matcher");
  router.addRoute({
    path: "/designer-preview",
    name: "StaticPage",
    component: mode === "preview" ? PreviewPage : StaticPage,
    props: true,
    meta: { public: true },
  });
  router.addRoute(matcher);

  router.beforeEach((to, from, next) => {
    if (to.path === "/designer-preview") {
      next();
    } else {
      next({ path: "/designer-preview", query: to.query, hash: to.hash });
    }
  });
}

// eslint-disable-next-line no-restricted-exports
export default {
  install: async (app: App, options: PageBuilderPluginOptionsType) => {
    modifyRequests();

    const builderOrigin = getBuilderOrigin();

    modifyRoutes(options.router, builderOrigin ? "designer" : "preview");

    if (builderOrigin) {
      const bodyEl = createOverlay();
      handleMessages(app, options, bodyEl);

      const customComponents = await getRegisteredComponents();
      window.parent.postMessage({ source: "preview", type: "loaded", data: customComponents }, builderOrigin);
      await options.router.push("/designer-preview");
    } else {
      const pageId = getPreviewPageId();
      await options.router.push(`/designer-preview?pageId=${pageId!}`);
    }
  },
};
