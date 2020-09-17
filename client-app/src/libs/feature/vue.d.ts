import Vue from "vue"
import FeatureNames from "libs/feature/constants/featureNames";

declare module 'vue/types/vue' {

  interface Vue {
    $features: FeatureNames;
    $isActive: (featureName: string) => boolean;
  }

  interface VueConstructor {
    $isActive: (featureName: string) => boolean;
  }
}

