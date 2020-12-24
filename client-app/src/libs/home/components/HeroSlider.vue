<template>
  <SfHero class="hero">
    <SfHeroItem
      v-for="(img, index) in heroes"
      :key="index"
      :image="img.image"
      :title="img.title"
      :subtitle="img.subtitle"
      :button-text="img.buttonText"
      :background="img.background"
      :class="img.className"></SfHeroItem>
  </SfHero>
</template>

<script>
import { SfHero } from '@storefront-ui/vue';
import { computed, ref } from '@vue/composition-api';

export default {
  components: { SfHero },
  setup(props, context) {
    const heroes = computed(() => [{
      //title: "Colorful summer dresses are already in store",
      //subtitle: "SUMMER COLLECTION 2020",
      //buttonText: "Learn more",
      background: "rgb(236, 239, 241)",
      image: "https://virtocommerce.blob.core.windows.net/catalog/slide_1.jpg"
    }, {
      //title: "Colorful summer dresses are already in store",
      //subtitle: "SUMMER COLLECTION 2020",
      //buttonText: "Learn more",
      background: "rgb(239, 235, 233)",
      image: "https://virtocommerce.blob.core.windows.net/catalog/slide_2.jpg"
      //className: "sf-hero-item--position-bg-top-left sf-hero-item--align-right"
    }]);

    return {
      heroes
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
</style>
