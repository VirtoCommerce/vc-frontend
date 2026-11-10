import { nextTick, watch } from "vue";
import { darkPresets, presets } from "@/assets/presets";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useLanguages } from "@/core/composables/useLanguages";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { globals } from "@/core/globals";
import {
  isThemeForLanguage,
  isTranslatableDictionary,
  readThemeSnapshotResponse,
  requestThemeSnapshot,
  resolveTranslatableValues,
  useThemeSnapshot,
} from "@/core/theme-snapshot";
import { DESIGNER_PREVIEW_PATH } from "@/core/theme-snapshot/query";
import { Logger } from "@/core/utilities";
import {
  BUILT_IN_TEMPLATES,
  getTemplatePageType,
  opensNewWindow,
  useStaticPage,
  useTemplateConditions,
  useThemeTemplates,
} from "@/shared/static-content";
import { withPreviewId } from "./builder-preview.protocol";
import { findEditableTexts, InlineTextEditor } from "./inline-text-editor";
import { SectionOverlay } from "./section-overlay";
import { PREVIEW_PROTOCOL } from "./utils";
import type { IRenderMessage, IResolvedData } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { SharedComponentOverlay } from "./shared-component-overlay";
import type { IThemeDraft, IThemeItem, IThemePageDocument } from "@/core/theme-snapshot";
import type { IThemeConfigPreset } from "@/core/types";
import type { Router } from "vue-router";

export const PREVIEW_CAPABILITIES = ["templates", "layouts", "groups", "inline-edit", "color-scheme", "inspector"];

const LOG_SCOPE = "[builder-preview]";

const PAGE_INPUT_EVENTS = ["keydown", "keyup", "click", "submit"] as const;

interface ISchemaField {
  id?: string;
  type?: string;
  format?: string;
  translatable?: boolean;
  multiline?: boolean;
  element?: ISchemaField[];
}

interface ISchemaWithSettings {
  settings?: ISchemaField[];
  includeShared?: string[];
}

export function buildPreviewCatalog(schemas: PageBuilderSchemaType): Record<string, unknown> {
  const catalog = {
    ...schemas,
    paletteTokens: { light: tokensOf(presets), dark: tokensOf(darkPresets) },
  };

  return {
    ...catalog,
    hash: hashOf(JSON.stringify(catalog)),
    protocol: PREVIEW_PROTOCOL,
    capabilities: PREVIEW_CAPABILITIES,
    conditions: useTemplateConditions().getTemplateConditionDescriptors(),
    builtInTemplates: Object.keys(BUILT_IN_TEMPLATES),
  };
}

/** A palette may set any token some built-in preset sets, because the styles read all of them. */
function tokensOf(presetsByName: Record<string, IThemeConfigPreset>): string[] {
  return [...new Set(Object.values(presetsByName).flatMap((preset) => Object.keys(preset)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** FNV-1a, only to detect a changed catalog: not a security boundary. */
function hashOf(text: string): string {
  let hash = 0x811c9dc5;

  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

interface IPreviewV2Options {
  router: Router;
  body: HTMLElement;
  blocker: HTMLElement;
  schemas: () => PageBuilderSchemaType | undefined;
  post: (type: string, data: unknown) => void;
  renderPage: (message: IRenderMessage) => Promise<void>;
  allowNavigation: (url: string | undefined) => void;
  applyLocale: (cultureName?: string) => Promise<void>;
  hasPreviewToken: () => boolean;
  sharedComponents?: Pick<SharedComponentOverlay, "setEnabled" | "findPlacementAt">;
  enqueue: (task: () => Promise<void>) => void;
}

export function createPreviewV2(options: IPreviewV2Options) {
  const { router, body, blocker, post } = options;
  const { setDraft, published, setPublished, theme: renderedTheme } = useThemeSnapshot();
  const { setOpenTemplate, lastResolution, setLastResolution } = useThemeTemplates();
  const { staticPagePreview, staticPagePreviewSubject } = useStaticPage();
  const { setColorModeOverride } = useDarkMode();
  const { themeFieldsSetByWhiteLabeling } = useWhiteLabeling();
  const { defaultStoreCulture } = useLanguages();

  let isInspectorEnabled = false;
  let lastRender: IRenderMessage | undefined;
  let heldRender: IRenderMessage | undefined;
  let heldDraft: IThemeDraft | undefined;

  const overlay = new SectionOverlay(
    body,
    blocker,
    (selection, event) => {
      post("select", selection);
      startEditing(selection.blockId ?? selection.sectionId, event);
    },
    (sectionId) => post("hover", { sectionId }),
    (clientX, clientY) => options.sharedComponents?.findPlacementAt(clientX, clientY) ?? null,
  );

  const editor = new InlineTextEditor(
    blocker,
    (edit) => {
      const cultureName = isTranslatable(edit.itemId, edit.path) ? globals.cultureName : undefined;
      post("edit", { ...edit, cultureName });
    },
    () => {
      const theme = heldDraft;
      const render = heldRender;
      heldDraft = undefined;
      heldRender = undefined;

      if (theme) {
        applyDraft(theme);
      }

      if (render) {
        options.enqueue(() => handleRender(render));
      }
    },
  );

  watch(lastResolution, () => reportResolved());

  function isBlocking(): boolean {
    return isInspectorEnabled || options.hasPreviewToken() || lastRender === undefined;
  }

  function applyInteraction(): void {
    blocker.style.pointerEvents = isBlocking() ? "auto" : "none";
    overlay.setEnabled(isInspectorEnabled);
    options.sharedComponents?.setEnabled(isInspectorEnabled);
  }

  // The blocker stops the pointer only. Tab still moves through the page so the keyboard can leave the frame;
  // a key, click or submit on a page element does not act.
  function stopPageInput(event: Event): void {
    const { target } = event;
    const isPageTarget =
      target instanceof Element && target !== blocker && target !== body && target !== document.documentElement;
    const isTab = event instanceof KeyboardEvent && event.key === "Tab";

    if (!blocker.isConnected || !isBlocking() || editor.isEditing || !isPageTarget || isTab) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // With the inspector off, clicks reach the page: a link the router does not take would load another document.
  function stopLeavingLink(event: MouseEvent): void {
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;

    if (
      !blocker.isConnected ||
      event.defaultPrevented ||
      !(anchor instanceof HTMLAnchorElement) ||
      opensNewWindow(anchor.getAttribute("target"))
    ) {
      return;
    }

    const url = new URL(anchor.href);
    const { location } = globalThis;
    const isFragmentOnly =
      !!url.hash &&
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search;

    if ((url.protocol === "http:" || url.protocol === "https:") && !isFragmentOnly) {
      event.preventDefault();
    }
  }

  function setInspector(isEnabled: boolean): void {
    isInspectorEnabled = isEnabled;
    if (!isEnabled) {
      editor.end();
    }
    applyInteraction();
  }

  function setColorScheme(scheme: "light" | "dark"): void {
    setColorModeOverride(scheme);
  }

  function applyDraft(theme: IThemeDraft): void {
    // The echo of the text being edited would re-render it under the caret, so it waits for the edit like a render.
    if (editor.isEditing) {
      heldDraft = theme;
      return;
    }

    setDraft(theme);
    overlay.scheduleRender();
  }

  async function handleRender(message: IRenderMessage): Promise<void> {
    if (editor.isEditing) {
      heldRender = message;
      return;
    }

    lastRender = message;
    await options.applyLocale(message.cultureName);
    await ensureSnapshotLanguage(message.cultureName);
    overlay.setLabels(message.sectionLabels ?? {});

    if (message.templateKey) {
      setOpenTemplate(message.templateKey, withHoverModel(message.document, message.model));
      staticPagePreview.value = undefined;

      if (message.url && router.currentRoute.value.fullPath !== message.url) {
        // The target page chooses after its data loads; the previous page's choice must not be reported until then.
        setLastResolution(undefined);
        options.allowNavigation(message.url);
        await router.push(message.url);
      }
    } else {
      setOpenTemplate(undefined);
      // On the preview route the template rules must see the real page, else the address the designer named.
      staticPagePreviewSubject.value = message.page ?? (message.url ? { permalink: message.url } : undefined);
      options.allowNavigation(undefined);
      await options.renderPage(message);
    }

    applyInteraction();
    body.style.visibility = "visible";

    await nextTick();

    const { sectionId, blockId, scroll } = message.selection ?? {};
    overlay.select(blockId ?? sectionId ?? null, blockId ? (sectionId ?? null) : null, !!scroll);
    reportResolved();
  }

  async function ensureSnapshotLanguage(cultureName: string): Promise<void> {
    const current = published.value;

    if (!current || !globals.storeId || isThemeForLanguage(current, cultureName)) {
      return;
    }

    try {
      const theme = readThemeSnapshotResponse(
        await requestThemeSnapshot({ storeId: globals.storeId, cultureName }).response,
        cultureName,
      );
      setPublished(theme);
    } catch (error) {
      Logger.warn(`${LOG_SCOPE} The theme snapshot in ${cultureName} did not load`, error);
    }
  }

  function reportResolved(): void {
    const resolution = lastResolution.value;
    const render = lastRender;

    if (!resolution || !render || resolution.pageType !== getRenderPageType(render)) {
      return;
    }

    const data: IResolvedData = {
      url: render.templateKey ? router.currentRoute.value.fullPath : (render.url ?? router.currentRoute.value.fullPath),
      pageType: resolution.pageType,
      template: resolution.template,
      ruleId: resolution.ruleId,
      // A copy: the resolution is a readonly proxy, which postMessage cannot clone.
      rules: { template: resolution.rules.template, ruleId: resolution.rules.ruleId },
      overriddenByWhiteLabeling: themeFieldsSetByWhiteLabeling.value,
    };

    post("resolved", data);
  }

  function startEditing(itemId: string, event: MouseEvent): void {
    const item = findItem(itemId);

    if (item) {
      const shown = resolveTranslatableValues(item, globals.cultureName, defaultStoreCulture.value);
      editor.start(
        findEditableTexts(
          shown,
          (itemType, path) => isPlainTextSetting(options.schemas(), itemType, path),
          (itemType, path) => !!findSchemaField(options.schemas(), itemType, path)?.multiline,
        ),
        event.clientX,
        event.clientY,
      );
    }
  }

  function findItem(itemId: string): IThemeItem | undefined {
    const sources = [
      lastRender?.document.content ?? [],
      renderedTheme.value?.header?.content ?? [],
      renderedTheme.value?.footer?.content ?? [],
    ] as IThemeItem[][];

    for (const item of sources.flat()) {
      if (item.id === itemId) {
        return item;
      }

      const block = item.blocks?.find((candidate) => candidate.id === itemId);

      if (block) {
        return block;
      }
    }

    return undefined;
  }

  function isTranslatable(itemId: string, path: (string | number)[]): boolean {
    const item = findItem(itemId);
    const value = path.reduce<unknown>(
      (current, key) => (current as Record<string | number, unknown> | undefined)?.[key],
      item,
    );

    return (
      isTranslatableDictionary(value) || (!!item && !!findSchemaField(options.schemas(), item.type, path)?.translatable)
    );
  }

  /** Re-renders so data loaded as the previous preview user (prices, availability) loads again as the current one. */
  async function reload(): Promise<void> {
    // During an inline edit the newest render is the held one; the last shown predates the typed text.
    const render = heldRender ?? lastRender;

    if (!render) {
      return;
    }

    if (render.templateKey && render.url) {
      await router.push(DESIGNER_PREVIEW_PATH);
    }

    // The page renders anew from its top, so the selection is brought back into view.
    await handleRender(render.selection ? { ...render, selection: { ...render.selection, scroll: true } } : render);
  }

  for (const type of PAGE_INPUT_EVENTS) {
    document.addEventListener(type, stopPageInput, true);
  }

  document.addEventListener("click", stopLeavingLink);

  applyInteraction();

  return {
    applyDraft,
    handleRender,
    setInspector,
    setColorScheme,
    reload,
    hover: (sectionId: string | null) => overlay.hover(sectionId),
    refreshInteraction: applyInteraction,
  };
}

/** The preview protocol accepts inline edits only for settings of schema type `string` that are not links. */
export function isPlainTextSetting(
  schemas: PageBuilderSchemaType | undefined,
  itemType: string,
  path: (string | number)[],
): boolean {
  const field = findSchemaField(schemas, itemType, path);
  return field?.type === "string" && field.format !== "url";
}

export function findSchemaField(
  schemas: PageBuilderSchemaType | undefined,
  itemType: string,
  path: (string | number)[],
): ISchemaField | undefined {
  const schema = (schemas?.sections[itemType] ?? schemas?.blocks[itemType]) as ISchemaWithSettings | undefined;
  const sharedFields = (schema?.includeShared ?? []).flatMap(
    (name) => (schemas?.shared[name] as ISchemaWithSettings | undefined)?.settings ?? [],
  );
  let fields: ISchemaField[] | undefined = [...(schema?.settings ?? []), ...sharedFields];
  let field: ISchemaField | undefined;

  for (const key of path.filter((step): step is string => typeof step === "string")) {
    field = fields?.find((candidate) => candidate.id === key);
    fields = field?.element;
  }

  return field;
}

function getRenderPageType(render: IRenderMessage): string {
  return render.templateKey ? getTemplatePageType(render.templateKey) : "page";
}

function withHoverModel(document: IThemePageDocument, model: IRenderMessage["model"]): IThemePageDocument {
  if (!model) {
    return document;
  }

  const item = withPreviewId(model) as IThemeItem;

  return { ...document, content: [...document.content, item] };
}

export type PreviewV2Type = ReturnType<typeof createPreviewV2>;
