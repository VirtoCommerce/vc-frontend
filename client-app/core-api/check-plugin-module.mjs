/**
 * Verifies a backend module that ships a storefront plugin.
 *
 *   yarn check:plugin-module <path-to-*.Web> [--artifact <module.zip>] [--env <storefront-url>]
 *
 * Without flags it checks the module's sources; --artifact checks a built package, --env a running
 * storefront. Exits 1 when any check fails.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  STOREFRONT_APP_DIR,
  checkArtifact,
  checkEnvironment,
  checkModuleFiles,
  formatResults,
  parseModuleManifest,
} from "./plugin-module.mjs";

const USAGE = "Usage: yarn check:plugin-module <path-to-*.Web> [--artifact <module.zip>] [--env <storefront-url>]";
const VALUE_FLAGS = new Set(["--artifact", "--env"]);

const options = {};
const positional = [];
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  const [flag, inlineValue] = arg.split(/=(.*)/s);
  if (!arg.startsWith("--")) {
    positional.push(arg);
  } else if (VALUE_FLAGS.has(flag)) {
    const value = inlineValue ?? args[++index];
    if (!value || value.startsWith("--")) {
      console.error(`${flag} needs a value.\n${USAGE}`);
      process.exit(1);
    }
    options[flag.slice(2)] = value;
  } else {
    console.error(`Unknown flag: ${arg}\n${USAGE}`);
    process.exit(1);
  }
}
if (positional.length !== 1) {
  console.error(USAGE);
  process.exit(1);
}

/** The source check above already reports a missing or broken file; here it only means "unknown". */
function readOrUndefined(read) {
  try {
    return read();
  } catch {
    return undefined;
  }
}

const webDir = resolve(process.cwd(), positional[0]);
const sections = [{ title: "Module sources", results: checkModuleFiles(webDir) }];

if (options.artifact) {
  sections.push({ title: "Module package", results: checkArtifact(resolve(process.cwd(), options.artifact)) });
}
if (options.env) {
  const pluginId = readOrUndefined(
    () => JSON.parse(readFileSync(join(webDir, STOREFRONT_APP_DIR, "public", "plugin.json"), "utf8")).id,
  );
  const moduleId = readOrUndefined(() => parseModuleManifest(readFileSync(join(webDir, "module.manifest"), "utf8")).id);
  sections.push({
    title: `Environment ${options.env}`,
    results: pluginId
      ? await checkEnvironment(options.env, { pluginId, moduleId })
      : [{ status: "fail", message: "no plugin id: public/plugin.json is missing or not JSON" }],
  });
}

for (const { title, results } of sections) {
  console.log(`\n${title}\n${formatResults(results)}`);
}
const statuses = new Set(sections.flatMap(({ results }) => results.map((result) => result.status)));
const failed = statuses.has("fail");
const summary = statuses.has("warn") ? "All checks passed, but read the ⚠️ lines above." : "All checks passed.";
console.log(failed ? "\nSome checks failed." : `\n${summary}`);
process.exit(failed ? 1 : 0);
