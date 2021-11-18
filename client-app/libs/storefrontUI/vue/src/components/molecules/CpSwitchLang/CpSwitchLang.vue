<template>
  <SfSelect
    class="cp-switch-lang"
    name="language"
    label="language"
    @input="onChange">
    <template #label>
      <SfImage class="cp-switch-lang__img" :src="getFlagImgName() | assetUrl"></SfImage>
      <SfIcon class="cp-switch-lang__icon" icon="arrow_down">
      </SfIcon>
    </template>
    <SfSelectOption
      v-for="lang in languages"
      :key="lang"
      :value="lang">
      {{ lang }}
    </SfSelectOption>
  </Sfselect>
</template>
<script>

import { SfSelect, SfIcon, SfImage } from "@libs/storefrontUI/vue";
export default {
  name: "CpSwitchLang",
  components: {
    SfIcon,
    SfSelect,
    SfImage
  },
  props: {
    selected: {
      type: String,
      "default": ""
    },
    languages: {
      type: Array,
      "default": []
    }
  },
  methods: {
    getFlagImgName() {
      return `images/flag-${this.selected}.png`;
    },
    onChange(lang) {
      console.log(lang);
      this.$emit("change", lang);
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/molecules/CpSwitchLang.scss";
</style>
