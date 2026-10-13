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

const webDir = resolve(process.cwd(), positional[0]);
const sections = [["Module sources", checkModuleFiles(webDir)]];

if (options.artifact) {
  sections.push(["Module package", checkArtifact(resolve(process.cwd(), options.artifact))]);
}
if (options.env) {
  let pluginId;
  try {
    pluginId = JSON.parse(readFileSync(join(webDir, STOREFRONT_APP_DIR, "public", "plugin.json"), "utf8")).id;
  } catch {
    pluginId = undefined;
  }
  sections.push([
    `Environment ${options.env}`,
    pluginId
      ? await checkEnvironment(options.env, pluginId)
      : [{ status: "fail", message: "no plugin id: public/plugin.json is missing or not JSON" }],
  ]);
}

for (const [title, results] of sections) {
  console.log(`\n${title}\n${formatResults(results)}`);
}
const failed = sections.some(([, results]) => results.some((result) => result.status === "fail"));
console.log(failed ? "\nSome checks failed." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
