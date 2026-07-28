import { existsSync } from "node:fs";
import { generate } from "@graphql-codegen/cli";
import {
  addExtension,
  describeErrorDetails,
  groupByStatus,
  isSchemaEndpointAbsent,
  normalizeBackendUrl,
} from "./utils.js";
import type { ModuleType, OutcomeType } from "./utils.js";

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const SUMMARY_WIDTH = 64;

const backendUrl = normalizeBackendUrl(process.env.APP_BACKEND_URL);

const core = {
  apiPath: "client-app/core/api/graphql",
  commonFragmentsPath: "client-app/core/api/graphql/common/fragments",
  schemaPath: `${backendUrl}/graphql`,
  clientDirectivesPath: "client-app/core/api/graphql/_clientDirectives.graphql",
} as const;

// WARNING: Disabling TLS certificate validation exposes the application to man-in-the-middle attacks.
// This must NEVER be enabled in production. Only use for local development with self-signed certificates.
// To enable, set LOCAL_DEV_ALLOW_INSECURE_TLS="true" in your environment in addition to NODE_ENV="development".
if (
  process.env.NODE_ENV === "development" &&
  // eslint-disable-next-line sonarjs/null-dereference -- false positive: normalizeBackendUrl always returns a string
  backendUrl.startsWith("https://localhost") &&
  process.env.LOCAL_DEV_ALLOW_INSECURE_TLS === "true"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// if a module does not have separated schema - use `core.schemaPath`
// a module that is not installed on The Platform is reported as skipped and keeps the run green,
// so there is no need to comment it out to get types for the other modules
const independentModules: ModuleType[] = [
  {
    name: "CustomerReviews",
    apiPath: "client-app/modules/customer-reviews/api/graphql",
    schemaPath: `${backendUrl}/graphql/customerReviews`,
  },
  {
    name: "PushMessages",
    apiPath: "client-app/modules/push-messages/api/graphql",
    schemaPath: `${backendUrl}/graphql/pushMessages`,
  },
  {
    name: "Quotes",
    apiPath: "client-app/modules/quotes/api/graphql",
    schemaPath: `${backendUrl}/graphql/quote`,
    // Include specific core fragments that quotes module uses
    requiredCommonFragments: [
      `${core.commonFragmentsPath}/money.graphql`,
      `${core.commonFragmentsPath}/currency.graphql`,
    ],
  },
  {
    name: "BackInStock",
    apiPath: "client-app/modules/back-in-stock/api/graphql",
    schemaPath: `${backendUrl}/graphql/back-in-stock`,
  },
  {
    name: "News",
    apiPath: "client-app/modules/news/api/graphql",
    schemaPath: `${backendUrl}/graphql/news`,
  },
  {
    name: "Loyalty",
    apiPath: "client-app/modules/loyalty/api/graphql",
    schemaPath: `${backendUrl}/graphql/loyalty`,
  },
  {
    name: "SalesRep",
    apiPath: "client-app/modules/sales-rep/api/graphql",
    schemaPath: `${backendUrl}/graphql/sales-rep`,
  },
  /* EXPERIMENTAL FEATURE
  {
    name: "PurchaseRequests",
    apiPath: "client-app/modules/purchase-requests/api/graphql",
    schemaPath: `${backendUrl}/graphql/aiDocumentProcessing`,
  },*/
];

const CONFIG = {
  dedupeFragments: true,
  identifierName: "OperationNames",
  maybeValue: "T",
  scalars: {
    BigInt: "number",
    Byte: "number",
    Date: "string",
    DateOnly: "string",
    Decimal: "number",
    DynamicPropertyValue: "string | number | boolean | null",
    Guid: "string",
    Half: "number",
    Long: "number",
    Milliseconds: "number",
    ModuleSettingValue: "string | number | boolean | null",
    OptionalDecimal: "number | undefined",
    OptionalNullableDecimal: "number | null | undefined",
    OptionalString: "string | undefined",
    PropertyValue: "string | number | boolean | null",
    SByte: "number",
    Seconds: "number",
    Short: "number",
    TimeOnly: "string",
    UInt: "number",
    ULong: "number",
    Uri: "string",
    UShort: "number",
  },
  skipTypename: true,
  useTypeImports: true,
  skipGraphQLImport: true,
};

const PLUGINS = [
  {
    add: {
      content: "// This file is auto-generated. Do not edit manually.\n",
    },
  },
  "typescript",
  "typescript-operations",
  "typed-document-node",
  "named-operations-object",
];

async function runCodegen() {
  if (!backendUrl) {
    console.error(`${RED}✖ APP_BACKEND_URL is not set, there is no schema to generate types from.${RESET}`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nGenerating GraphQL types from "${backendUrl}":`);

  const coreOutcome = await generateTypes({
    name: "Core",
    schemaUrl: core.schemaPath,
    schema: [core.schemaPath, core.clientDirectivesPath],
    documents: [
      addExtension(core.apiPath),
      // exclude independent modules from general modules
      ...independentModules.map((module) => `!${addExtension(module.apiPath)}`),
      // exclude client-only directive declarations — they are not operations
      `!${core.clientDirectivesPath}`,
    ],
    typesPath: `${core.apiPath}/types.ts`,
  });

  if (coreOutcome.status !== "generated") {
    // Every module request would fail the same way without the core schema, so there is nothing to continue with.
    reportAbortedCore(coreOutcome);
    process.exitCode = 1;
    return;
  }

  reportOutcome(coreOutcome);

  // Reported as each module settles, so a slow environment keeps showing progress. The array itself
  // stays in declaration order, which is what the summary reads.
  const moduleOutcomes = await Promise.all(
    independentModules.map((module) =>
      generateTypes({
        name: module.name,
        schemaUrl: module.schemaPath,
        schema: module.schemaPath,
        documents: [
          addExtension(module.apiPath),
          // Include specific required fragments for validation
          ...(module.requiredCommonFragments ?? []),
        ],
        typesPath: `${module.apiPath}/types.ts`,
      }).then(reportOutcome),
    ),
  );

  printSummary([coreOutcome, ...moduleOutcomes]);

  // Skipped modules are a normal state of a partially installed environment and keep the run green,
  // a module that broke while its schema was reachable does not.
  if (moduleOutcomes.some(({ status }) => status === "failed")) {
    process.exitCode = 1;
  }
}

async function generateTypes({
  name,
  schemaUrl,
  schema,
  documents,
  typesPath,
}: {
  name: string;
  /** the endpoint to check for presence, `schema` may additionally hold local files */
  schemaUrl: string;
  schema: string | string[];
  documents: string[];
  typesPath: string;
}): Promise<OutcomeType> {
  if (await isSchemaEndpointAbsent(schemaUrl)) {
    // The bare fact, so that both a skipped module and an aborted core can phrase it their own way.
    return { name, typesPath, status: "skipped", reason: `"${schemaUrl}" answered 404` };
  }

  try {
    await generate(
      {
        schema,
        silent: true,
        documents,
        generates: {
          [typesPath]: {
            plugins: PLUGINS,
            config: CONFIG,
          },
        },
      },
      true,
    );

    return { name, typesPath, status: "generated" };
  } catch (err) {
    // The endpoint answered the probe, so whatever went wrong here is a real problem.
    return { name, typesPath, status: "failed", error: err };
  }
}

/** Returns the outcome so it can be reported inline while the results are being collected. */
function reportOutcome(outcome: OutcomeType): OutcomeType {
  switch (outcome.status) {
    case "generated":
      reportSuccess(outcome);
      break;
    case "skipped":
      reportSkip(outcome);
      break;
    case "failed":
      reportFailure(outcome);
      break;
  }

  return outcome;
}

function reportSuccess({ name, typesPath }: OutcomeType): void {
  console.log(`${GREEN}✔${RESET} ${BOLD}${name}${RESET}: types generated in "${typesPath}"`);
}

function reportSkip({ name, typesPath, reason }: OutcomeType): void {
  const consequence = existsSync(typesPath)
    ? `keeping the committed "${typesPath}"`
    : `"${typesPath}" is missing, imports from this module will not type-check`;

  console.warn(
    `${YELLOW}⚠${RESET} ${BOLD}${name}${RESET}: not installed on The Platform, module skipped — ${consequence}\n  ${reason}`,
  );
}

function reportFailure({ name, error }: OutcomeType): void {
  console.error(`${RED}✖${RESET} ${BOLD}${name}${RESET}: types generation failed\n  ${describeErrorDetails(error)}`);
}

function reportAbortedCore(outcome: OutcomeType): void {
  if (outcome.status === "skipped") {
    // Not a module: an absent core endpoint means the URL or the backend itself is wrong.
    console.error(
      `${RED}✖${RESET} ${BOLD}Core${RESET}: no GraphQL schema at "${core.schemaPath}"\n  ${outcome.reason}`,
    );
  } else {
    reportFailure(outcome);
  }

  console.error(
    `${RED}The core schema is required, aborting. Check APP_BACKEND_URL and that the backend runs.${RESET}`,
  );
}

function printSummary(outcomes: OutcomeType[]): void {
  const { generated, skipped, failed } = groupByStatus(outcomes);
  // A rule above the heading instead of a boxed frame: module lists are long and would break side borders.
  const names = (group: OutcomeType[]) => group.map(({ name }) => name).join(", ");

  console.log(`\n${"━".repeat(SUMMARY_WIDTH)}\n${BOLD}GraphQL types generation summary${RESET}`);
  console.log(`  ${GREEN}✔ generated (${generated.length})${RESET}: ${names(generated)}`);

  if (skipped.length) {
    console.log(`  ${YELLOW}⚠ skipped, schema not available (${skipped.length})${RESET}: ${names(skipped)}`);
  }

  if (failed.length) {
    console.log(`  ${RED}✖ failed (${failed.length})${RESET}: ${names(failed)}`);
  }
}

runCodegen().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
