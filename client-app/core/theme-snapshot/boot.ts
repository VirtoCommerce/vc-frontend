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
   * Asks again in the store and language `pageContext` resolved as soon as the boot snapshot turns out to be for
   * another one, so the second request runs alongside the rest of boot rather than after it.
   */
  prepare(context: IThemeSnapshotContext): void;
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

type RefetchType = () => Promise<OutcomeType>;

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
  let refetch: Promise<OutcomeType> | undefined;
  const settled = readOutcome(request).then((value) => {
    outcome = value;
    return value;
  });

  function getRefetch(context: IThemeSnapshotContext): RefetchType {
    return () =>
      (refetch ??= readOutcome(requestThemeSnapshot({ ...context, permalink: request.variables.permalink })));
  }

  return {
    prepare(context) {
      void settled.then((value) => {
        if (isForOtherContext(value, context)) {
          void getRefetch(context)();
        }
      });
    },
    async settle(context) {
      if (!outcome) {
        void settled.then((value) => acceptLate(value, context, getRefetch(context)));
        return;
      }

      await accept(outcome, context, getRefetch(context));
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
    const ask = () => readOutcome(requestThemeSnapshot(context));

    try {
      await acceptLate(await ask(), context, ask);
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

async function accept(outcome: OutcomeType, context: IThemeSnapshotContext, refetch: RefetchType): Promise<void> {
  const { setPublished } = useThemeSnapshot();

  if ("error" in outcome) {
    return failBoot(outcome.error);
  }

  if (!isForOtherContext(outcome, context)) {
    setPublished(outcome.result);
    return;
  }

  const pending = refetch();
  const second = await withTimeout(pending, THEME_SNAPSHOT_REFETCH_TIMEOUT_MS);

  if (!second) {
    void pending.then((value) => acceptLate(value, context));
    return;
  }

  if ("error" in second) {
    return failBoot(second.error);
  }

  setPublished(second.result);
}

function failBoot(error: unknown): void {
  Logger.warn(`${LOG_SCOPE} The theme snapshot request failed; the built-in templates are used`, error);
  useThemeSnapshot().setFailed();
}

/** Without `refetch`, a snapshot for another store or language is kept as it is: the request is not repeated. */
async function acceptLate(outcome: OutcomeType, context: IThemeSnapshotContext, refetch?: RefetchType): Promise<void> {
  const { setLate, setFailed } = useThemeSnapshot();

  if ("error" in outcome) {
    setFailed();
    return;
  }

  if (!refetch || !isForOtherContext(outcome, context)) {
    setLate(outcome.result);
    return;
  }

  await acceptLate(await refetch(), context);
}

/**
 * A theme is for the context when its store is the one `pageContext` resolved and the request asked for its language:
 * a language the publication has no file for is served in the store default language, and asking again would get the
 * same.
 */
function isForOtherContext(
  outcome: OutcomeType,
  context: IThemeSnapshotContext,
): outcome is { result: IPublishedTheme } {
  return (
    "result" in outcome &&
    !!outcome.result &&
    (outcome.result.storeId !== context.storeId || !isThemeForLanguage(outcome.result, context.cultureName))
  );
}

async function readOutcome(request: IThemeSnapshotRequest): Promise<OutcomeType> {
  try {
    const { cultureName, permalink } = request.variables;
    return { result: readThemeSnapshotResponse(await request.response, cultureName, permalink) };
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
