import { useAuth } from "@/core/composables/useAuth";
import { OpenAPI } from "./generated";

let isConfigured = false;

function resolveBaseUrl(): string {
  if (import.meta.env.APP_BACKEND_URL) {
    return import.meta.env.APP_BACKEND_URL as string;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "";
}

export function ensurePlatformApiClientConfigured(): void {
  if (isConfigured) {
    return;
  }

  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    console.warn("Platform API base URL is empty. Check APP_BACKEND_URL env variable.");
  }

  OpenAPI.BASE = baseUrl;
  OpenAPI.WITH_CREDENTIALS = false;

  OpenAPI.HEADERS = async () => {
    if (typeof window === "undefined") {
      return {};
    }

    const { headers, isExpired, refresh } = useAuth();

    if (isExpired() === true) {
      await refresh();
    }

    return { ...headers.value };
  };

  isConfigured = true;
}
