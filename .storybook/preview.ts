import { app } from "@storybook/vue3";
import SettingsData from "../config/settings_data.json";
import VcLabel from "../client-app/ui-kit/components/atoms/label/vc-label.vue";
import VcFormDetails from "../client-app/ui-kit/components/atoms/form-details/vc-form-details.vue";
import VcIcon from "../client-app/ui-kit/components/atoms/icon/vc-icon.vue";
import VcInput from "../client-app/ui-kit/components/molecules/input/vc-input.vue";

import "@fontsource/lato/300.css";
import "@fontsource/lato";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";
import "@fontsource/roboto-condensed/700.css";

import "../client-app/assets/styles/main.scss";

Object.entries(SettingsData.presets.Mercury)
  .filter(([key]) => /^color/.test(key))
  .forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, `${value}`);
  });

app.component("VcIcon", VcIcon);
app.component("VcLabel", VcLabel);
app.component("VcFormDetails", VcFormDetails);
app.component("VcInput", VcInput);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
};
