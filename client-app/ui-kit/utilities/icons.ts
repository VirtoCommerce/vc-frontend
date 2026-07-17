import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";
import { resolveIconName } from "./icon-aliases";

export type IconVariantType = "solid" | "outline";

// Icons are emitted as hashed static asset files (not JS chunks) and fetched on demand.
// The eager registry below holds only tiny name -> URL strings; it grows linearly with the
// icon count, so if the outline set ever reaches ~5k+, split this registry into its own
// async chunk instead of keeping it in the app-wide eager entry.
const solidUrls = import.meta.glob<string>("../icons/solid/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

const outlineUrls = import.meta.glob<string>("../icons/outline/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

function toMap(urls: Record<string, string>): Map<string, () => Promise<string>> {
  const map = new Map<string, () => Promise<string>>();

  for (const [path, url] of Object.entries(urls)) {
    // eslint-disable-next-line sonarjs/null-dereference -- path is a typed string key; the rule is a false positive here
    const fileName = path.split("/").pop()?.replace(".svg", "");

    if (fileName) {
      // Memoize per icon: import() was deduped by the module cache, fetch() is not,
      // so without this every icon instance on a page would issue its own request.
      let cached: Promise<string> | undefined;

      map.set(fileName, () => {
        cached ??= fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} for ${url}`);
            }
            return response.text();
          })
          .catch((error: unknown) => {
            // Don't cache failures — allow a retry on the next render.
            cached = undefined;
            throw error;
          });
        return cached;
      });
    }
  }

  return map;
}

const solidMap = toMap(solidUrls);
const outlineMap = toMap(outlineUrls);

let defaultIconVariant: IconVariantType = "outline";

export function setDefaultIconVariant(variant: IconVariantType): void {
  defaultIconVariant = variant;
}

export function resolveIcon(
  name?: string,
  variant?: IconVariantType,
): { loader?: () => Promise<string>; isOutline: boolean } {
  if (!name) {
    return { isOutline: false };
  }

  const effectiveVariant = variant ?? defaultIconVariant;
  const canonicalName = resolveIconName(name);

  if (effectiveVariant === "solid") {
    // Aliases are one-directional (legacy name -> Lucide name), so the solid branch matches the
    // raw name (solid files keep legacy names). A Lucide-named icon requested as solid whose only
    // solid asset lives under a legacy name won't match here and falls through to outline below
    // (variant="solid" is best-effort: an icon with no solid asset renders its outline glyph).
    if (solidMap.has(name)) {
      return { loader: solidMap.get(name), isOutline: false };
    }
    if (outlineMap.has(canonicalName)) {
      return { loader: outlineMap.get(canonicalName), isOutline: true };
    }
    return { isOutline: false };
  }

  if (outlineMap.has(canonicalName)) {
    return { loader: outlineMap.get(canonicalName), isOutline: true };
  }
  if (solidMap.has(name)) {
    return { loader: solidMap.get(name), isOutline: false };
  }
  return { isOutline: true };
}

export async function loadIconRaw(
  name?: string,
  variant?: IconVariantType,
): Promise<{ raw: string; isOutline: boolean }> {
  const { loader, isOutline } = resolveIcon(name, variant);

  if (!loader) {
    if (name) {
      Logger.error(`Failed to load icon: ${name}`);
    }

    return { raw: "", isOutline };
  }

  try {
    const raw = await loader();

    return { raw: DOMPurify.sanitize(raw), isOutline };
  } catch (error) {
    Logger.error(`Failed to load icon: ${name}`, error);

    return { raw: "", isOutline };
  }
}
