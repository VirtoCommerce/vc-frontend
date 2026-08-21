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
  fragmentsPath: "client-app/core/api/graphql/fragments",
  catalogFragmentsPath: "client-app/core/api/graphql/catalog/fragments",
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
// a module missing from the target environment is skipped, so it need not be commented out
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
    // Codegen does not follow #import outside a module's own apiPath, so the storefront fragments the
    // read-only order page reuses have to be listed here.
    requiredCommonFragments: [
      `${core.commonFragmentsPath}/money.graphql`,
      `${core.commonFragmentsPath}/currency.graphql`,
      `${core.catalogFragmentsPath}/property.graphql`,
      `${core.fragmentsPath}/fullOrderFields.graphql`,
      `${core.fragmentsPath}/shortOrderFields.graphql`,
      `${core.fragmentsPath}/orderAddressFields.graphql`,
      `${core.fragmentsPath}/orderLineItemFields.graphql`,
    ],
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
    // Without the core schema every module would fail the same way.
    reportAbortedCore(coreOutcome);
    process.exitCode = 1;
    return;
  }

  reportOutcome(coreOutcome);

  // Reported as each module settles; the array keeps declaration order for the summary.
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

  // A partially installed environment is normal and stays green; a broken module does not.
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
  schemaUrl: string;
  schema: string | string[];
  documents: string[];
  typesPath: string;
}): Promise<OutcomeType> {
  if (await isSchemaEndpointAbsent(schemaUrl)) {
    const reason = `"${schemaUrl}" answered 404`;

    // Reusing a committed types.ts is what makes skipping safe; without one there is nothing to reuse.
    return existsSync(typesPath)
      ? { name, typesPath, status: "skipped", reason }
      : {
          name,
          typesPath,
          status: "failed",
          error: new Error(`${reason} and "${typesPath}" has never been generated`),
        };
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
  // 404 is evidence, not proof: a renamed endpoint answers the same way, so the wording stays factual.
  console.warn(
    `${YELLOW}⚠${RESET} ${BOLD}${name}${RESET}: no schema at its endpoint, module skipped as not installed — keeping the committed "${typesPath}"\n  ${reason}`,
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
  // A rule above the heading rather than a box: module lists are long and would break side borders.
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
