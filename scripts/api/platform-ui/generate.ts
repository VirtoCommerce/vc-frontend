import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generate } from "openapi-typescript-codegen";

const DEFAULT_SCHEMA_URL = "https://travel-admin-dev.azurewebsites.net/docs/PlatformUI/swagger.json";
const OUTPUT_PATH = "client-app/core/api/platform-ui/generated";
const SCHEMA_CACHE_PATH = "scripts/api/platform-ui/.cache/swagger.json";

async function run() {
  const schemaPath = await resolveSchemaPath();
  const outputPath = resolve(process.cwd(), OUTPUT_PATH);

  console.log(`Generating Platform UI client from "${schemaPath}"...`);

  await generate({
    input: schemaPath,
    output: outputPath,
    httpClient: "fetch",
    useUnionTypes: true,
    useOptions: true,
  });

  console.log(`Platform UI client has been generated in "${OUTPUT_PATH}".`);
}

async function resolveSchemaPath(): Promise<string> {
  const customPath = process.env.PLATFORM_UI_SWAGGER_PATH;
  if (customPath) {
    const absolutePath = resolve(process.cwd(), customPath);
    await ensureFileExists(absolutePath);
    return absolutePath;
  }

  const schemaUrl = process.env.PLATFORM_UI_SWAGGER_URL ?? DEFAULT_SCHEMA_URL;
  return downloadSchema(schemaUrl);
}

async function ensureFileExists(path: string): Promise<void> {
  try {
    await access(path, constants.F_OK);
  } catch {
    throw new Error(`Platform UI swagger schema file was not found at "${path}".`);
  }
}

async function downloadSchema(url: string): Promise<string> {
  console.log(`Downloading Platform UI swagger schema from "${url}"...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download swagger schema. Status: ${response.status} ${response.statusText}`);
  }

  const data = await response.text();
  const cachePath = resolve(process.cwd(), SCHEMA_CACHE_PATH);
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, data, "utf8");

  return cachePath;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
