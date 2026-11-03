import { nextTick, watch } from "vue";
import { darkPresets, presets } from "@/assets/presets";
import { useDarkMode } from "@/core/composables/useDarkMode";
import { useLanguages } from "@/core/composables/useLanguages";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { globals } from "@/core/globals";
import {
  isTranslatableDictionary,
  readThemeSnapshotResponse,
  requestThemeSnapshot,
  resolveTranslatableValues,
  useThemeSnapshot,
} from "@/core/theme-snapshot";
import { Logger } from "@/core/utilities";
import { useStaticPage, useTemplateConditions, useThemeTemplates } from "@/shared/static-content";
import { findEditableTexts, InlineTextEditor } from "./inline-text-editor";
import { findSectionElement, SectionOverlay } from "./section-overlay";
import type { IRenderMessage } from "./builder-preview.protocol";
import type { PageBuilderSchemaType } from "./models/PageBuilderSchemaType";
import type { IThemeDraft, IThemeItem } from "@/core/theme-snapshot";
import type { Router } from "vue-router";

export const PREVIEW_PROTOCOL = 2;

/** What this storefront does for the Vue designer (preview protocol 2). */
export const PREVIEW_CAPABILITIES = ["templates", "layouts", "groups", "inline-edit", "color-scheme", "inspector"];

const LOG_SCOPE = "[builder-preview]";

/** The schemas the storefront has always announced, with what protocol 2 adds: a hash, the palette tokens, the rules. */
export function buildPreviewCatalog(schemas: PageBuilderSchemaType): Record<string, unknown> {
  const catalog = {
    ...schemas,
    paletteTokens: { light: Object.keys(presets.default ?? {}), dark: Object.keys(darkPresets.default ?? {}) },
  };

  return {
    ...catalog,
    hash: hashOf(JSON.stringify(catalog)),
    protocol: PREVIEW_PROTOCOL,
    capabilities: PREVIEW_CAPABILITIES,
    conditions: useTemplateConditions().getTemplateConditionDescriptors(),
  };
}

/** FNV-1a: a catalog changes its hash whenever anything in it changes. Not a security boundary. */
function hashOf(text: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
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
}

/**
 * The Vue designer's side of the preview: the draft layer, one render message, the inspector, light and dark, inline
 * editing and the `resolved` report. Created when the designer connects with protocol 2.
 */
export function createPreviewV2(options: IPreviewV2Options) {
  const { router, body, blocker, post } = options;
  const { setDraft, draft, published, setPublished } = useThemeSnapshot();
  const { setOpenTemplate, lastResolution } = useThemeTemplates();
  const { staticPagePreview, staticPagePreviewSubject } = useStaticPage();
  const { colorMode } = useDarkMode();
  const { themeFieldsSetByWhiteLabeling } = useWhiteLabeling();
  const { defaultStoreCulture } = useLanguages();

  let isInspectorEnabled = false;
  let lastRender: IRenderMessage | undefined;
  let heldRender: IRenderMessage | undefined;

  const overlay = new SectionOverlay(
    body,
    blocker,
    (selection, event) => {
      post("select", selection);
      startEditing(selection.blockId ?? selection.sectionId, event);
    },
    (sectionId) => post("hover", { sectionId }),
  );

  const editor = new InlineTextEditor(
    blocker,
    (edit) => {
      const cultureName = isTranslatable(edit.itemId, edit.path) ? globals.cultureName : undefined;
      post("edit", { ...edit, cultureName });
    },
    () => {
      const render = heldRender;
      heldRender = undefined;
      if (render) {
        void handleRender(render);
      }
    },
  );

  watch(lastResolution, () => reportResolved());

  /** Clicks stay blocked until the designer turns the inspector off, and always while impersonating a user. */
  function applyInteraction(): void {
    const isBlocking = isInspectorEnabled || options.hasPreviewToken() || lastRender === undefined;
    blocker.style.pointerEvents = isBlocking ? "auto" : "none";
    overlay.setEnabled(isInspectorEnabled);
  }

  function setInspector(isEnabled: boolean): void {
    isInspectorEnabled = isEnabled;
    if (!isEnabled) {
      editor.end();
    }
    applyInteraction();
  }

  function setColorScheme(scheme: "light" | "dark"): void {
    colorMode.value = scheme;
  }

  function applyDraft(theme: IThemeDraft): void {
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
      setOpenTemplate(message.templateKey, message.document);
      staticPagePreview.value = undefined;

      if (message.url && router.currentRoute.value.fullPath !== message.url) {
        options.allowNavigation(message.url);
        await router.push(message.url);
      }
    } else {
      setOpenTemplate(undefined);
      staticPagePreviewSubject.value = message.page;
      await options.renderPage(message);
    }

    const selected = message.selection?.blockId ?? message.selection?.sectionId ?? null;
    overlay.select(selected);
    applyInteraction();
    body.style.visibility = "visible";

    await nextTick();

    if (selected && message.selection?.scroll) {
      findSectionElement(selected)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    overlay.scheduleRender();
    reportResolved();
  }

  /** A render in a language the snapshot is not in asks for the snapshot in it. */
  async function ensureSnapshotLanguage(cultureName: string): Promise<void> {
    const current = published.value;

    if (!current || !globals.storeId || current.cultureName.toLowerCase() === cultureName.toLowerCase()) {
      return;
    }

    try {
      const theme = readThemeSnapshotResponse(
        await requestThemeSnapshot({ storeId: globals.storeId, cultureName }).response,
      );
      setPublished(theme);
    } catch (error) {
      Logger.warn(`${LOG_SCOPE} The theme snapshot in ${cultureName} did not load`, error);
    }
  }

  function reportResolved(): void {
    const resolution = lastResolution.value;

    if (!resolution || !lastRender) {
      return;
    }

    post("resolved", {
      url: router.currentRoute.value.fullPath,
      pageType: resolution.pageType,
      template: resolution.template,
      ruleId: resolution.ruleId,
      overriddenByWhiteLabeling: themeFieldsSetByWhiteLabeling.value,
    });
  }

  function startEditing(itemId: string, event: MouseEvent): void {
    const item = findItem(itemId);

    if (item) {
      const shown = resolveTranslatableValues(item, globals.cultureName, defaultStoreCulture.value);
      editor.start(findEditableTexts(shown), event.clientX, event.clientY);
    }
  }

  /** The item as the designer has it: on the rendered page, in the template it renders, or in the header and footer. */
  function findItem(itemId: string): IThemeItem | undefined {
    const sources = [
      lastRender?.document.content ?? [],
      draft.value?.header?.content ?? published.value?.snapshot.header?.content ?? [],
      draft.value?.footer?.content ?? published.value?.snapshot.footer?.content ?? [],
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

    if (isTranslatableDictionary(value)) {
      return true;
    }

    const schemas = options.schemas();
    const schema = item ? (schemas?.sections[item.type] ?? schemas?.blocks[item.type]) : undefined;
    const settings = (schema as { settings?: { id?: string; translatable?: boolean }[] } | undefined)?.settings;

    return !!settings?.some((setting) => setting.id === path[0] && setting.translatable);
  }

  applyInteraction();

  return {
    applyDraft,
    handleRender,
    setInspector,
    setColorScheme,
    hover: (sectionId: string | null) => overlay.hover(sectionId),
    refreshInteraction: applyInteraction,
  };
}

export type PreviewV2Type = ReturnType<typeof createPreviewV2>;
