import DOMPurify from "dompurify";
import { Logger } from "@/core/utilities";

export type IconVariantType = "solid" | "outline";

const solidLoaders = import.meta.glob("../icons/solid/*.svg", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const outlineLoaders = import.meta.glob("../icons/outline/*.svg", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function toMap(loaders: Record<string, () => Promise<string>>): Map<string, () => Promise<string>> {
  const map = new Map<string, () => Promise<string>>();

  for (const [path, loader] of Object.entries(loaders)) {
    // eslint-disable-next-line sonarjs/null-dereference -- path is a typed string key; the rule is a false positive here
    const fileName = path.split("/").pop()?.replace(".svg", "");

    if (fileName) {
      map.set(fileName, loader);
    }
  }

  return map;
}

const solidMap = toMap(solidLoaders);
const outlineMap = toMap(outlineLoaders);

export function resolveIcon(
  name?: string,
  variant?: IconVariantType,
): { loader?: () => Promise<string>; isOutline: boolean } {
  if (!name) {
    return { isOutline: false };
  }

  if (variant === "outline") {
    return { loader: outlineMap.get(name), isOutline: true };
  }

  if (variant === "solid") {
    return { loader: solidMap.get(name), isOutline: false };
  }

  if (outlineMap.has(name)) {
    return { loader: outlineMap.get(name), isOutline: true };
  }

  return { loader: solidMap.get(name), isOutline: false };
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
