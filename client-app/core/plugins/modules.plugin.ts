import type { ModuleSettingsType, ModuleSettingType } from "@/core/api/graphql/types";
import type { Plugin } from "vue";

function initGA(settings: ModuleSettingType[]) {
  const isEnabled = !!settings.find((el) => el.name === "GoogleAnalytics4.EnableTracking")?.value;
  const id = settings.find((el) => el.name === "GoogleAnalytics4.MeasurementId")?.value as string;
  if (isEnabled && id && window) {
    const script = document.createElement("script");
    script.type = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.src = "url";

    document.head.appendChild(script);

    (window as GlobalContext).dataLayer = (window as GlobalContext).dataLayer || [];
    (window as GlobalContext).gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (window as GlobalContext).dataLayer.push(arguments);
    };
    gtag("js", new Date());
    gtag("config", id, { debug_mode: true });
    // todo currency check
    gtag("set", { currency: "USD" });
  }
}

const MODULES = {
  "VirtoCommerce.GoogleEcommerceAnalytics": initGA,
} as { [key: string]: (...args: unknown[]) => unknown };

export const modulesPlugin: Plugin = {
  install: (_, modules: ModuleSettingsType[] = []) => {
    modules.forEach((module) => {
      MODULES[module.moduleId] && MODULES[module.moduleId](module.settings);
    });
  },
};
