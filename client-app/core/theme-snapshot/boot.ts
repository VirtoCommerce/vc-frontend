import { START_LOCATION } from "vue-router";
import { Logger } from "@/core/utilities";
import { isNewPageBuilderEnabled } from "./enabled";
import {
  isThemeForLanguage,
  isThemeSnapshotRejected,
  readThemeSnapshotResponse,
  requestThemeSnapshot,
  takeBootThemeSnapshotRequest,
} from "./request";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemeSnapshotRequest } from "./request";
import type { IPublishedTheme } from "./types";
import type { Router } from "vue-router";

export interface IThemeSnapshotContext {
  storeId: string;
  cultureName: string;
}

export interface IThemeSnapshotBoot {
  /** Starts early when the boot snapshot is for another context, so the second request runs alongside boot. */
  prepare(context: IThemeSnapshotContext): void;
  /** A snapshot still in flight is not waited for: it takes over on the next navigation. Never throws. */
  settle(context: IThemeSnapshotContext): Promise<void>;
}

export const THEME_SNAPSHOT_REFETCH_TIMEOUT_MS = 1500;

const LOG_SCOPE = "[theme-snapshot]";

type OutcomeType = { result: IPublishedTheme | null } | { error: unknown };

type RefetchType = () => Promise<OutcomeType>;

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
 * A late snapshot takes over after a navigation, so the page being left is never re-rendered.
 * The first navigation does not retry: the request failed only moments before.
 */
export function installThemeSnapshotNavigation(router: Router, getContext: () => IThemeSnapshotContext): void {
  if (!isNewPageBuilderEnabled()) {
    return;
  }

  const { promoteLate, hasFailed, isRejected } = useThemeSnapshot();
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

    if (
      failure ||
      isSamePage ||
      promoteLate() ||
      from === START_LOCATION ||
      !hasFailed.value ||
      isRejected.value ||
      isRetrying
    ) {
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
  useThemeSnapshot().setFailed(isThemeSnapshotRejected(error));
}

async function acceptLate(outcome: OutcomeType, context: IThemeSnapshotContext, refetch?: RefetchType): Promise<void> {
  const { setLate, setFailed } = useThemeSnapshot();

  if ("error" in outcome) {
    setFailed(isThemeSnapshotRejected(outcome.error));
    return;
  }

  if (!refetch || !isForOtherContext(outcome, context)) {
    setLate(outcome.result);
    return;
  }

  await acceptLate(await refetch(), context);
}

/** A language the publication has no file for is served in the store default: asking again would get the same. */
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
