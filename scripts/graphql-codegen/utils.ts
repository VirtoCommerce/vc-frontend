export type ModuleType = {
  name: string;
  apiPath: string;
  schemaPath: string;
  requiredCommonFragments?: string[]; // Specific core fragment files that module depends on
};

export type OutcomeStatusType =
  /** `types.ts` has been written */
  | "generated"
  /** the module is not installed on The Platform, so it exposes no schema endpoint */
  | "skipped"
  /** the schema endpoint answered, but generation broke */
  | "failed";

export type OutcomeType = {
  name: string;
  typesPath: string;
  status: OutcomeStatusType;
  /** short human-readable explanation, set for `skipped` */
  reason?: string;
  /** the original error, set for `failed` */
  error?: unknown;
};

/** Codegen appends a long cheat sheet of the supported schema formats to schema loading failures. */
const CODEGEN_HINT_HEADING = "GraphQL Code Generator supports:";

/** Enough of a failure to act on without pasting a whole response body into the terminal. */
const MAX_DETAILS_LENGTH = 2000;

const PROBE_TIMEOUT_MS = 15_000;

/** The cheapest valid query every GraphQL endpoint answers, used to tell 404 from a working module. */
const PROBE_BODY = JSON.stringify({ query: "{__typename}" });

/** `https://host/` and `https://host` must produce the same schema URL, `//graphql` answers 404. */
export function normalizeBackendUrl(url: string | undefined): string {
  let normalized = (url ?? "").trim();

  // eslint-disable-next-line sonarjs/null-dereference -- false positive: trim() always returns a string
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * The Platform answers 404 on the scoped GraphQL endpoint of a module it does not have installed,
 * and that is the only response proving the module is absent. Every other outcome — 401, 500, an
 * HTML page, a connection error — means generation must be attempted and its error reported, so that
 * a broken or misconfigured endpoint is never silently mistaken for an uninstalled module.
 */
export async function isSchemaEndpointAbsent(url: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: PROBE_BODY,
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    return response.status === 404;
  } catch {
    // Let codegen make the call: it reaches the endpoint on its own terms (proxies, TLS overrides).
    return false;
  }
}

/** Codegen wraps loader failures into an `AggregateError` holding one error per schema source. */
export function collectErrorMessages(error: unknown): string[] {
  const messages = error instanceof Error && error.message ? [error.message] : [];
  const nested = (error as { errors?: unknown } | null | undefined)?.errors;

  if (Array.isArray(nested)) {
    messages.push(...nested.flatMap((item) => collectErrorMessages(item)));
  }

  return messages;
}

/** Turns a multi-line codegen message into one line, without the cheat sheet nobody reads. */
export function stripCodegenHint(message: string): string {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: message is a typed string parameter
  const hintAt = message.indexOf(CODEGEN_HINT_HEADING);

  return (hintAt === -1 ? message : message.slice(0, hintAt)).replace(/\s+/g, " ").trim();
}

export function truncate(text: string, maxLength: number): string {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: text is a typed string parameter
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/** Everything known about a failure, readable enough to act on. */
export function describeErrorDetails(error: unknown): string {
  // An aggregate error repeats its only nested message as its own, printing it twice helps nobody.
  const messages = [...new Set(collectErrorMessages(error).map(stripCodegenHint))];

  if (!messages.length) {
    return String(error ?? "unknown error");
  }

  return messages.map((message) => truncate(message, MAX_DETAILS_LENGTH)).join("\n  ");
}

export function groupByStatus(outcomes: OutcomeType[]): Record<OutcomeStatusType, OutcomeType[]> {
  return {
    generated: outcomes.filter(({ status }) => status === "generated"),
    skipped: outcomes.filter(({ status }) => status === "skipped"),
    failed: outcomes.filter(({ status }) => status === "failed"),
  };
}

export function addExtension(path: string): string {
  return `${path}/**/*.(graphql|gql)`;
}
