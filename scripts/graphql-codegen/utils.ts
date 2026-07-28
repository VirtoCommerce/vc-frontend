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
  /** short explanation, set for `skipped` */
  reason?: string;
  /** the original error, set for `failed` */
  error?: unknown;
};

/** Codegen appends a cheat sheet of the supported schema formats to every schema loading failure. */
const CODEGEN_HINT_HEADING = "GraphQL Code Generator supports:";

/** Enough of a failure to act on without pasting a whole response body into the terminal. */
const MAX_DETAILS_LENGTH = 2000;

const PROBE_TIMEOUT_MS = 15_000;

/** The cheapest query every GraphQL endpoint answers, so an endpoint that rejects GET still counts. */
const PROBE_BODY = JSON.stringify({ query: "{__typename}" });

/** A trailing slash would produce `//graphql`, which answers 404. */
export function normalizeBackendUrl(url: string | undefined): string {
  let normalized = (url ?? "").trim();

  // eslint-disable-next-line sonarjs/null-dereference -- false positive: trim() always returns a string
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * A 404 is the only answer The Platform gives for a module it does not have. Anything else — 401,
 * 500, an HTML page, a connection error — means generation must be attempted and its error reported,
 * so that a broken or misconfigured endpoint is never mistaken for an uninstalled module.
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
    // Codegen reaches the endpoint on its own terms (proxies, TLS overrides), so let it decide.
    return false;
  }
}

/**
 * Codegen sets an `AggregateError`'s own message to its nested messages joined together, so the
 * leaves carry everything. `seen` guards against a self-referential `errors` chain.
 */
export function collectErrorMessages(error: unknown, seen: Set<unknown> = new Set()): string[] {
  if (typeof error === "object" && error !== null) {
    if (seen.has(error)) {
      return [];
    }

    seen.add(error);
  }

  const nested = (error as { errors?: unknown } | null | undefined)?.errors;
  const nestedMessages = Array.isArray(nested) ? nested.flatMap((item) => collectErrorMessages(item, seen)) : [];

  if (nestedMessages.length) {
    return nestedMessages;
  }

  return error instanceof Error && error.message ? [error.message] : [];
}

/** Turns a multi-line codegen message into one line, without the cheat sheet. */
export function stripCodegenHint(message: string): string {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: message is a typed string parameter
  const hintAt = message.indexOf(CODEGEN_HINT_HEADING);

  return (hintAt === -1 ? message : message.slice(0, hintAt)).replace(/\s+/g, " ").trim();
}

export function truncate(text: string, maxLength: number): string {
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: text is a typed string parameter
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function describeErrorDetails(error: unknown): string {
  const messages = [...new Set(collectErrorMessages(error).map(stripCodegenHint))];

  if (!messages.length) {
    return describeValue(error);
  }

  return messages.map((message) => truncate(message, MAX_DETAILS_LENGTH)).join("\n  ");
}

/** Last resort for a rejection with no error message: an object's content is all it has to offer. */
function describeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "unknown error";
  }

  if (value instanceof Error) {
    return value.name;
  }

  if (typeof value === "string") {
    return truncate(value, MAX_DETAILS_LENGTH);
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  try {
    // JSON.stringify answers undefined for a function.
    const serialized: string | undefined = JSON.stringify(value);

    return truncate(serialized ?? Object.prototype.toString.call(value), MAX_DETAILS_LENGTH);
  } catch {
    return "unserializable error object";
  }
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
