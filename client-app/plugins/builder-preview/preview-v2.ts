import { v4 as uuidv4 } from "uuid";
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
import { getTemplatePageType, useStaticPage, useTemplateConditions, useThemeTemplates } from "@/shared/static-content";
import { findEditableTexts, InlineTextEditor } from "./inline-text-editor";
import { SectionOverlay } from "./section-overlay";
import type { IRenderMessage, IResolvedData } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { SharedComponentOverlay } from "./shared-component-overlay";
import type { IThemeDraft, IThemeItem, IThemePageDocument } from "@/core/theme-snapshot";
import type { IThemeConfigPreset } from "@/core/types";
import type { Router } from "vue-router";

export const PREVIEW_PROTOCOL = 2;

/** What this storefront does for the Vue designer (preview protocol 2). */
export const PREVIEW_CAPABILITIES = ["templates", "layouts", "groups", "inline-edit", "color-scheme", "inspector"];

const LOG_SCOPE = "[builder-preview]";

/** A setting in a section's or block's schema; a list's or object's settings are its `element`. */
interface ISchemaField {
  id?: string;
  type?: string;
  translatable?: boolean;
  element?: ISchemaField[];
}

/** A section's or block's schema: its own settings, and the shared setting groups it includes by name. */
interface ISchemaWithSettings {
  settings?: ISchemaField[];
  includeShared?: string[];
}

/** The schemas the storefront has always announced, with what protocol 2 adds: a hash, the palette tokens, the rules. */
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
  };
}

/** Every token any built-in preset sets: the styles read each of them, so a palette may set any of them. */
function tokensOf(presetsByName: Record<string, IThemeConfigPreset>): string[] {
  return [...new Set(Object.values(presetsByName).flatMap((preset) => Object.keys(preset)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** FNV-1a: a catalog changes its hash whenever anything in it changes. Not a security boundary. */
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
  /** Renders a page document on the preview route, as protocol 1 does. */
  renderPage: (message: IRenderMessage) => Promise<void>;
  /** Lets the preview route navigate to a storefront page, which it otherwise does not. */
  allowNavigation: (url: string) => void;
  applyLocale: (cultureName?: string) => Promise<void>;
  hasPreviewToken: () => boolean;
  /** The outlines of shared components placed on the page, which follow the inspector as the sections' do. */
  sharedComponents?: Pick<SharedComponentOverlay, "setEnabled" | "findPlacementAt">;
  /** Runs a task in the designer's message queue, after the messages before it. */
  enqueue: (task: () => Promise<void>) => void;
}

/**
 * The Vue designer's side of the preview: the draft layer, one render message, the inspector, light and dark, inline
 * editing and the `resolved` report. Created when the designer connects with protocol 2.
 */
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
    (clientX, clientY) => !!options.sharedComponents?.findPlacementAt(clientX, clientY),
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

  /** Clicks stay blocked until the designer turns the inspector off, and always while impersonating a user. */
  function applyInteraction(): void {
    const isBlocking = isInspectorEnabled || options.hasPreviewToken() || lastRender === undefined;
    blocker.style.pointerEvents = isBlocking ? "auto" : "none";
    overlay.setEnabled(isInspectorEnabled);
    options.sharedComponents?.setEnabled(isInspectorEnabled);
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
        // The page it goes to chooses once its data is there; until then the previous page's choice is not its own.
        setLastResolution(undefined);
        options.allowNavigation(message.url);
        await router.push(message.url);
      }
    } else {
      setOpenTemplate(undefined);
      // The page shows on the preview route: its rules see the page it is, else the address the designer named.
      staticPagePreviewSubject.value = message.page ?? (message.url ? { permalink: message.url } : undefined);
      await options.renderPage(message);
    }

    applyInteraction();
    body.style.visibility = "visible";

    await nextTick();

    const { sectionId, blockId, scroll } = message.selection ?? {};
    overlay.select(blockId ?? sectionId ?? null, blockId ? (sectionId ?? null) : null, !!scroll);
    reportResolved();
  }

  /** A render in a language the snapshot is not in asks for the snapshot in it. */
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
      editor.start(findEditableTexts(shown, isPlainTextField), event.clientX, event.clientY);
    }
  }

  /** The item as the designer has it: on the rendered page, in the template it renders, or in the header and footer. */
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

  /** A translatable setting: its value is a dictionary, or the schema of the item's type says so. */
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

  /** A setting the designer takes inline edits for: plain text by its schema, as the protocol requires. */
  function isPlainTextField(itemType: string, path: (string | number)[]): boolean {
    return findSchemaField(options.schemas(), itemType, path)?.type === "string";
  }

  /**
   * Shows the last render anew, so a page that loaded its data as another user (prices, availability) loads it again
   * as the one the designer previews as now.
   */
  async function reload(): Promise<void> {
    const render = lastRender;

    if (!render) {
      return;
    }

    if (render.templateKey && render.url) {
      await router.push(DESIGNER_PREVIEW_PATH);
    }

    // The page renders anew from its top, so the selection is brought back into view.
    await handleRender(render.selection ? { ...render, selection: { ...render.selection, scroll: true } } : render);
  }

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

/**
 * The schema field of a setting at the path in a section or block of the type: its own settings and the shared groups
 * it includes (`title`, `buttons`); a list's or object's setting is in its element, and list indexes are skipped.
 */
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

/** The page type a render shows: its template's, else a content page's. */
function getRenderPageType(render: IRenderMessage): string {
  return render.templateKey ? getTemplatePageType(render.templateKey) : "page";
}

/** A template with the section the designer shows on hover in its add-section list, at its end, as a page has it. */
function withHoverModel(document: IThemePageDocument, model: IRenderMessage["model"]): IThemePageDocument {
  if (!model) {
    return document;
  }

  // A model the designer offers has no id yet: only this preview copy gets one, for rendering and anchors.
  const item = { ...model, id: model.id ?? `__preview__${uuidv4()}` } as IThemeItem;

  return { ...document, content: [...document.content, item] };
}

export type PreviewV2Type = ReturnType<typeof createPreviewV2>;
