import _Vue from "vue";
import FeatureNames from "libs/feature/constants/featureNames";
import { isActive } from "libs/feature/services/featureManager";

// export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
export function FeaturesPlugin<S>(Vue: typeof _Vue): void {

  Vue.prototype.$features = FeatureNames;

  Vue.$isActive = isActive;

  Vue.prototype.$isActive = isActive;
}
