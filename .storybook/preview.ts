import { app } from "@storybook/vue3";
import VcFormDetails from "../client-app/ui-kit/components/atoms/form-details/vc-form-details.vue";
import VcIcon from "../client-app/ui-kit/components/atoms/icon/vc-icon.vue";
import VcLabel from "../client-app/ui-kit/components/atoms/label/vc-label.vue";
import VcInput from "../client-app/ui-kit/components/molecules/input/vc-input.vue";
import SettingsData from "../config/settings_data.json";

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
