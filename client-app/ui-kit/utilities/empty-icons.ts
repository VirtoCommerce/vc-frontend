import DOMPurify from "dompurify";
import { Logger } from "./logger";

// Drawn empty-state icons (VCDZ-934): 512 × 512 masters, each with its own circle plate. Like the kit icons they
// ship as hashed static files and are fetched on demand, so only the icon a screen shows is downloaded.
const emptyIconUrls = import.meta.glob<string>("../images/empty-states/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

const loaders = new Map<string, () => Promise<string>>();

for (const [path, url] of Object.entries(emptyIconUrls)) {
  // eslint-disable-next-line sonarjs/null-dereference -- path is a typed string key; the rule is a false positive here
  const fileName = path.split("/").pop()?.replace(".svg", "");

  if (fileName) {
    let cached: Promise<string> | undefined;

    loaders.set(fileName, () => {
      cached ??= fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url}`);
          }
          return response.text();
        })
        .catch((error: unknown) => {
          cached = undefined;
          throw error;
        });
      return cached;
    });
  }
}

export function hasEmptyIcon(name?: string): boolean {
  return !!name && loaders.has(name);
}

export async function loadEmptyIconRaw(name?: string): Promise<string> {
  const loader = name ? loaders.get(name) : undefined;

  if (!loader) {
    if (name) {
      Logger.error(`Failed to load empty-state icon: ${name}`);
    }
    return "";
  }

  try {
    return DOMPurify.sanitize(await loader());
  } catch (error) {
    Logger.error(`Failed to load empty-state icon: ${name}`, error);
    return "";
  }
}
