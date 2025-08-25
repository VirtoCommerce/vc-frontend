import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordName, RouteRecordRaw } from "vue-router";

const routePathMap: Record<string, Record<string, string>> = {
  Cart: { en: "/cart", pt: "/carrinho" },
  Product: { en: "/product/:productId", pt: "/produto/:productId" },
  Catalog: { en: "/catalog", pt: "/catalogo" },
  Category: { en: "/category/:categoryId", pt: "/categoria/:categoryId" },
  Search: { en: "/search", pt: "/pesquisar" },
  SignIn: { en: "/sign-in", pt: "/entrar" },
};

function extractParamNames(path: string): Set<string> {
  const params = new Set<string>();
  const regex = /:(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(path)) !== null) {
    params.add(match[1]);
  }
  return params;
}

function fillPathParams(template: string, params: Record<string, unknown>): string {
  return template.replace(/:(\w+)/g, (_match, key: string) => {
    const value = params[key];
    let raw: unknown = value;

    if (Array.isArray(value)) {
      raw = (value as unknown[])[0];
    }

    let str = "";
    if (raw !== undefined && raw !== null) {
      if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
        str = String(raw);
      }
    }
    return encodeURIComponent(str);
  });
}

function getLocalizedPathForName(
  name: RouteRecordName | null | undefined,
  locale: string,
  params = {},
): string | undefined {
  if (!name) {
    return undefined;
  }

  const perLocale = routePathMap[String(name)];
  const template = perLocale?.[locale];
  if (!template) {
    return undefined;
  }

  return fillPathParams(template, params);
}

function tryMatchTemplateAndExtractParams(template: string, path: string): Record<string, string> | null {
  // Convert ":param" to named groups
  const pattern = template.replace(/:\w+/g, (segment) => `(?<${segment.slice(1)}>[^/]+)`);
  const regex = new RegExp(`^${pattern}$`);
  const groups = regex.exec(path)?.groups;
  if (!groups) {
    return null;
  }
  return groups as Record<string, string>;
}

function getLocalizedPathForPath(path: string, locale: string): string | undefined {
  for (const perLocale of Object.values(routePathMap)) {
    for (const template of Object.values(perLocale)) {
      const params = tryMatchTemplateAndExtractParams(template, path);
      if (!params) {
        continue;
      }
      const targetTemplate = perLocale[locale];
      if (!targetTemplate) {
        return undefined;
      }
      return fillPathParams(targetTemplate, params);
    }
  }
  return undefined;
}

/**
 * This function is used to add localized aliases to the routes.
 */
export function withLocalizedAliases(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  function enhanceRoute(route: RouteRecordRaw): RouteRecordRaw {
    const enhanced: RouteRecordRaw = { ...route };

    if (enhanced.children?.length) {
      enhanced.children = enhanced.children.map(enhanceRoute);
    }

    const name = enhanced.name ? String(enhanced.name) : undefined;
    if (!name || !Object.hasOwn(routePathMap, name)) {
      return enhanced;
    }

    const perLocale = routePathMap[name];
    const basePath = enhanced.path;
    const baseParams = extractParamNames(basePath);

    const candidateAliases = Object.values(perLocale).filter((path) => path !== basePath);

    const validAliases = candidateAliases.filter((aliasPath) => {
      const aliasParams = extractParamNames(aliasPath);
      return baseParams.size === aliasParams.size && [...baseParams].every((p) => aliasParams.has(p));
    });

    let existingAliases: string[] = [];
    if (Array.isArray(enhanced.alias)) {
      existingAliases = enhanced.alias;
    } else if (typeof enhanced.alias === "string") {
      existingAliases = [enhanced.alias];
    }

    const merged = Array.from(new Set([...existingAliases, ...validAliases]));
    if (merged.length) {
      enhanced.alias = merged;
    }

    return enhanced;
  }

  return routes.map(enhanceRoute);
}

/**
 * This function returns a localized redirect if the current route is not the same as the localized path.
 */
export function resolveLocalizedRedirect(to: RouteLocationNormalized, locale: string): RouteLocationRaw | void {
  if (to.name) {
    const localizedPath = getLocalizedPathForName(to.name, locale, to.params);
    if (localizedPath && localizedPath !== to.path) {
      return { path: localizedPath, query: to.query, hash: to.hash, replace: true };
    }
  } else {
    const localizedPath = getLocalizedPathForPath(to.path, locale);
    if (localizedPath && localizedPath !== to.path) {
      return { path: localizedPath, query: to.query, hash: to.hash, replace: true };
    }
  }

  return undefined;
}
