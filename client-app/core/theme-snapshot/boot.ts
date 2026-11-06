import { START_LOCATION } from "vue-router";
import { Logger } from "@/core/utilities";
import { isNewPageBuilderEnabled } from "./enabled";
import {
  isThemeForLanguage,
  readThemeSnapshotResponse,
  requestThemeSnapshot,
  takeBootThemeSnapshotRequest,
} from "./request";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemeSnapshotRequest } from "./request";
import type { IPublishedTheme } from "./types";
import type { Router } from "vue-router";

/** The store and language `pageContext` resolved: a snapshot is used only for them. */
export interface IThemeSnapshotContext {
  storeId: string;
  cultureName: string;
}

export interface IThemeSnapshotBoot {
  /**
   * Accepts the boot snapshot for the store and language `pageContext` resolved. A snapshot that has not arrived yet
   * is not waited for: it takes over on the next navigation inside the site. Never throws.
   */
  settle(context: IThemeSnapshotContext): Promise<void>;
}

/** How long boot waits for a second request when the first one answered for another store or language. */
export const THEME_SNAPSHOT_REFETCH_TIMEOUT_MS = 1500;

const LOG_SCOPE = "[theme-snapshot]";

type OutcomeType = { result: IPublishedTheme | null } | { error: unknown };

/**
 * Picks up the request the inline script in `index.html` sent, or sends it when the script did not run. Returns
 * nothing when the storefront is built without `new_page_builder_enabled`: then no request is sent at all.
 */
export function startThemeSnapshot(fallback: { domain: string; cultureName?: string }): IThemeSnapshotBoot | undefined {
  if (!isNewPageBuilderEnabled()) {
    return undefined;
  }

  const request = takeBootThemeSnapshotRequest() ?? requestThemeSnapshot(fallback);
  let outcome: OutcomeType | undefined;
  const settled = readOutcome(request).then((value) => {
    outcome = value;
    return value;
  });

  return {
    async settle(context) {
      if (!outcome) {
        void settled.then((value) => acceptLate(value, context));
        return;
      }

      await accept(outcome, context);
    },
  };
}

/**
 * Lets a snapshot that arrived late, or the retry of a failed request, take over once a navigation inside the site is
 * done: the next page renders with it, and neither the page being left nor a cancelled navigation is re-rendered.
 * The first navigation does not retry, as the request failed only moments before.
 */
export function installThemeSnapshotNavigation(router: Router, getContext: () => IThemeSnapshotContext): void {
  if (!isNewPageBuilderEnabled()) {
    return;
  }

  const { promoteLate, hasFailed } = useThemeSnapshot();
  let isRetrying = false;

  async function retry(context: IThemeSnapshotContext): Promise<void> {
    isRetrying = true;

    try {
      await acceptLate(await readOutcome(requestThemeSnapshot(context)), context);
    } finally {
      isRetrying = false;
    }
  }

  router.afterEach((to, from, failure) => {
    // A query or hash change (sorting, filters, an anchor) keeps the page, which must not change its theme under it.
    const isSamePage = from !== START_LOCATION && to.path === from.path;

    if (failure || isSamePage || promoteLate() || from === START_LOCATION || !hasFailed.value || isRetrying) {
      return;
    }

    void retry(getContext());
  });
}

async function accept(outcome: OutcomeType, context: IThemeSnapshotContext): Promise<void> {
  const { setPublished, setFailed } = useThemeSnapshot();

  if ("error" in outcome) {
    Logger.warn(`${LOG_SCOPE} The theme snapshot request failed; the built-in templates are used`, outcome.error);
    setFailed();
    return;
  }

  if (!outcome.result || matches(outcome.result, context)) {
    setPublished(outcome.result);
    return;
  }

  const refetch = readOutcome(requestThemeSnapshot(context));
  const second = await withTimeout(refetch, THEME_SNAPSHOT_REFETCH_TIMEOUT_MS);

  if (!second) {
    void refetch.then((value) => acceptLate(value, context, false));
    return;
  }

  if ("error" in second) {
    Logger.warn(`${LOG_SCOPE} The theme snapshot request failed; the built-in templates are used`, second.error);
    setFailed();
    return;
  }

  setPublished(second.result);
}

async function acceptLate(outcome: OutcomeType, context: IThemeSnapshotContext, canRefetch = true): Promise<void> {
  const { setLate, setFailed } = useThemeSnapshot();

  if ("error" in outcome) {
    setFailed();
    return;
  }

  if (!outcome.result || matches(outcome.result, context) || !canRefetch) {
    setLate(outcome.result);
    return;
  }

  await acceptLate(await readOutcome(requestThemeSnapshot(context)), context, false);
}

/**
 * The store must be the one `pageContext` resolved, and the request must have asked for its language: a language the
 * publication has no file for is served in the store default language, and asking again would get the same.
 */
function matches(theme: IPublishedTheme, context: IThemeSnapshotContext): boolean {
  return theme.storeId === context.storeId && isThemeForLanguage(theme, context.cultureName);
}

async function readOutcome(request: IThemeSnapshotRequest): Promise<OutcomeType> {
  try {
    return { result: readThemeSnapshotResponse(await request.response, request.variables.cultureName) };
  } catch (error) {
    return { error };
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => resolve(undefined), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
