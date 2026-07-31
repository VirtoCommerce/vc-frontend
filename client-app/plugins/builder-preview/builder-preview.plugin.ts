import { useGlobalInterceptors } from "@/core/api/common";
import { useLanguages } from "@/core/composables/useLanguages";
import { globals, setGlobals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useStaticPage } from "@/shared/static-content";
import { templateBlocks } from "@/shared/static-content/components";
import { addBuilderMessageListener, createPreviewLoadedNotifier } from "./builder-preview.protocol";
import PreviewPage from "./components/preview-page.vue";
import ScrollToElement from "./components/scroll-to-element.vue";
import {
  LINKED_COMPONENT_END_ANCHOR_ID,
  LinkedComponentOverlay,
  normalizeLinkedComponentBoundaries,
} from "./linked-component-overlay";
import { getRegisteredComponents } from "./register-components";
import { getBuilderOrigin, getPreviewCultureName, getPreviewPageId } from "./utils";
import type { TransferDataType } from "./builder-preview.protocol";
import type { PageBuilderPluginOptionsType } from "./models/PageBuilderPluginOptionsType";
import type { IThemeConfig } from "@/core/types";
import type { IPageContent, IPageTemplate } from "@/shared/static-content/types";
import type { App } from "vue";
import type { Router } from "vue-router";
import StaticPage from "@/pages/static-page.vue";

templateBlocks["scroll-to"] = ScrollToElement;

const { staticPagePreview } = useStaticPage();

// Switch the storefront preview to the edited page's language without touching the URL (VCST-5219).
// The designer preview runs on a fixed `/designer-preview` route (vue-router base ""), so we must not
// add a `/{lang}` prefix here; we re-apply the locale through the shared seam (app messages, UI kit
// and module bundles, number formats) and update globals.cultureName, which drives
// content-localized GraphQL queries on the next block remount.
async function applyPreviewLocale(rawCultureName?: string): Promise<void> {
  try {
    const { applyLocale, normalizeToSupportedCulture } = useLanguages();
    const cultureName = normalizeToSupportedCulture(rawCultureName);

    if (!cultureName || cultureName === globals.cultureName || !globals.i18n) {
      return;
    }

    await applyLocale(globals.i18n, cultureName, { rewriteUrl: false });
    setGlobals({ cultureName });
  } catch (error) {
    // Never propagate: the message handler reveals the preview body right after this, and a failed
    // locale switch must degrade to the boot language — not leave the preview permanently hidden.
    Logger.error("Failed to apply the preview locale", error);
  }
}

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

async function updatePreview(
  data: TransferDataType,
  options: { router: Router },
  linkedComponentOverlay: LinkedComponentOverlay | null,
) {
  const template = data.template;
  if (!template) {
    return;
  }

  const content = data.model ? [...template.content, data.model] : template.content;
  const newTemplate = { ...template, content: <IPageContent[]>[] };

  content.forEach((block: IPageContent) => {
    newTemplate.content.push({ type: "scroll-to", id: "__scroll__" + block.id }, block);
  });
  newTemplate.content.push({ type: "scroll-to", id: `__scroll__${LINKED_COMPONENT_END_ANCHOR_ID}` });

  if (!data.templateKey) {
    if (templateUrl) {
      await options.router.push("/designer-preview");
    }
    staticPagePreview.value = newTemplate;
  } else if (templateUrl) {
    await options.router.push(templateUrl);
  }
  templateUrl = undefined;

  linkedComponentOverlay?.update(
    content.map((block) => block.id),
    normalizeLinkedComponentBoundaries(data.linkedComponentBoundaries),
  );

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
    .filter(([key]) => key?.startsWith("color"))
    .forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key?.replaceAll("_", "-") ?? ""}`, value as string);
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
let originalUserId: string | undefined;
let pendingScrollRestore = false;
let initialSectionId: string | undefined;

function modifyRequests() {
  const { onRequest } = useGlobalInterceptors();

  // Take all previously registered interceptors (e.g. auth plugin)
  // and replace them with a single wrapper that runs them sequentially,
  // then applies preview overrides last.
  // This avoids the Promise.all race where auth's async refresh()
  // could overwrite the preview Authorization header.
  const existingInterceptors = onRequest.value.splice(0);

  onRequest.value.push(async (input, init) => {
    for (const intercept of existingInterceptors) {
      await intercept(input, init);
    }

    if (!init) {
      return;
    }

    // Only add x-template-builder header to HTTP requests (where init.headers exists),
    // not to WebSocket connectionParams (where init is a plain object).
    if (init.headers) {
      Object.assign(init.headers, { ["x-template-builder"]: "preview-mode" });
    }

    // Override Authorization on both init.headers and init itself,
    // because auth plugin may place it on either depending on
    // whether init.headers existed (HTTP requests vs WebSocket connectionParams).
    const target = init as Record<string, unknown>;
    if (previewToken) {
      if (init.headers) {
        (init.headers as Record<string, string>).Authorization = `Bearer ${previewToken}`;
      }
      target.Authorization = `Bearer ${previewToken}`;
    } else if (previewToken === null) {
      if (init.headers) {
        delete (init.headers as Record<string, string>).Authorization;
      }
      delete target.Authorization;
    }
  });
}

/** Largest value a CSS `z-index` accepts (2^31 - 1) — keeps the blocker above every storefront element. */
const MAX_Z_INDEX = 2147483647;

function createOverlay(builderOrigin: string): {
  bodyEl: HTMLElement | null;
  linkedComponentOverlay: LinkedComponentOverlay | null;
} {
  const bodyEl = document.getElementsByTagName("body").item(0);

  if (!bodyEl) {
    return { bodyEl: null, linkedComponentOverlay: null };
  }

  bodyEl.style.visibility = "hidden";
  bodyEl.style.position = "relative";
  const interactiveBlocker = document.createElement("div");
  // Cover the whole viewport and sit above every storefront element (sticky header, language
  // selector, etc.) so no in-preview interaction is possible inside the designer. This is what
  // prevents the user from switching the storefront language and hitting the `/fr/designer-preview`
  // 404 — the preview simply follows the edited page's language instead (VCST-5219).
  interactiveBlocker.style.position = "fixed";
  interactiveBlocker.style.inset = "0";
  interactiveBlocker.style.zIndex = String(MAX_Z_INDEX);
  interactiveBlocker.style.background = "transparent";
  interactiveBlocker.style.pointerEvents = "auto";
  bodyEl.appendChild(interactiveBlocker);

  const postSectionMessage = (type: "select" | "hover", sectionId: string | null) => {
    window.parent.postMessage({ source: "preview", type, data: { sectionId } }, builderOrigin);
  };
  const linkedComponentOverlay = new LinkedComponentOverlay(
    bodyEl,
    interactiveBlocker,
    (placementId) => postSectionMessage("select", placementId),
    (placementId) => postSectionMessage("hover", placementId),
  );

  return { bodyEl, linkedComponentOverlay };
}

async function handleMessage(
  app: App,
  options: PageBuilderPluginOptionsType,
  bodyEl: HTMLElement | null,
  linkedComponentOverlay: LinkedComponentOverlay | null,
  loadedNotifier: ReturnType<typeof createPreviewLoadedNotifier>,
  data: TransferDataType,
) {
  if (data.type === "connect") {
    loadedNotifier.announce();
    return;
  }

  // Render the preview in the edited page's language before it becomes visible (VCST-5219),
  // so a non-default-language page never flashes in the store default language.
  await applyPreviewLocale(data.cultureName);

  if (bodyEl) {
    bodyEl.style.visibility = "visible";
  }

  switch (data.type) {
    case "changed":
    case "update":
    case "remove":
    case "add":
    case "reload":
    case "page":
    case "swap":
    case "preview":
      await updatePreview(data, options, linkedComponentOverlay);
      break;

    case "hover":
      linkedComponentOverlay?.highlight(data.sectionId ?? null);
      break;
    case "select":
      if (data.sectionId) {
        initialSectionId = data.sectionId;
        if (!linkedComponentOverlay?.scrollToPlacement(data.sectionId)) {
          scrollToSection(data.sectionId);
        }
      }
      break;
    case "navigate": {
      // we will know about template it or not in the next message
      templateUrl = data.url;
      break;
    }
    case "settings":
      if (data.settings) {
        updateSettings(app, data.settings);
      }
      break;
    case "auth": {
      previewToken = data.token?.access_token || null;
      if (!originalUserId) {
        originalUserId = globals.userId;
      }
      setGlobals({ userId: data.userId || originalUserId });
      // Force remount of all blocks with new token and restore scroll afterward
      pendingScrollRestore = true;
      staticPagePreview.value = undefined;
      linkedComponentOverlay?.update([], []);
      break;
    }
    default:
      Logger.warn(`Unknown message type: ${data.type}`);
  }
}

function handleMessages(
  app: App,
  options: PageBuilderPluginOptionsType,
  builderOrigin: string,
  bodyEl: HTMLElement | null,
  linkedComponentOverlay: LinkedComponentOverlay | null,
  loadedNotifier: ReturnType<typeof createPreviewLoadedNotifier>,
) {
  // Builder messages arrive as independent tasks, and each handler awaits (locale switch, router
  // navigation), so unqueued handlers would interleave: an older message could apply its template
  // after a newer one. Chaining them keeps preview state in the order the builder sent it.
  let messageQueue: Promise<void> = Promise.resolve();

  return addBuilderMessageListener(window, builderOrigin, window.parent, (data) => {
    messageQueue = messageQueue.then(() =>
      handleMessage(app, options, bodyEl, linkedComponentOverlay, loadedNotifier, data).catch((error: unknown) => {
        // Never break the chain: a failed message must not stall every following one.
        Logger.error("Failed to handle the builder preview message", error);
      }),
    );
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
      const loadedNotifier = createPreviewLoadedNotifier(window.parent, builderOrigin);
      const { bodyEl, linkedComponentOverlay } = createOverlay(builderOrigin);
      handleMessages(app, options, builderOrigin, bodyEl, linkedComponentOverlay, loadedNotifier);

      const customComponents = await getRegisteredComponents();
      loadedNotifier.setData(customComponents);
      await options.router.push("/designer-preview");
    } else {
      // Preserve both pageId and cultureName so a refreshed or shared standalone-preview URL keeps
      // rendering in the page's language instead of the store default (VCST-5219).
      const query = new URLSearchParams();
      const pageId = getPreviewPageId();
      if (pageId) {
        query.set("pageId", pageId);
      }
      const cultureName = getPreviewCultureName();
      if (cultureName) {
        query.set("cultureName", cultureName);
      }
      await options.router.push(`/designer-preview?${query.toString()}`);
    }
  },
};
