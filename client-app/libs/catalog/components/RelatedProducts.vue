<template>
  <SfSection :title-heading="title" class="section">
    <SfLoader :class="{ loading }" :loading="loading">
      <SfCarousel
        data-cy="related-products-carousel"
        :settings="{ peek: 16, breakpoints: { 1023: { peek: 0, perView: 2 } } }"
        class="carousel">
        <SfCarouselItem v-for="(product, i) in products"
                        :key="i"
                        class="carousel__item">
          <SfProductCard
            :title="product.name"
            :image="product.imgSrc | imgUrl('348x348')"
            :regular-price="product.price.list | price"
            :special-price="product.price.actual | price(product.price.list)"
            :link="product.slug !== null? product.slug:''"></SfProductCard>
        </SfCarouselItem>
      </SfCarousel>
    </SfLoader>
  </SfSection>
</template>

<script lang="ts">

import {
  SfCarousel,
  SfProductCard,
  SfSection,
  SfLoader
} from '@libs/storefrontUI/vue';

export default {
  setup() {
    return {  };
  },
  components: {
    SfCarousel,
    SfProductCard,
    SfSection,
    SfLoader
  },
  props: {
    title: String,
    products: Array,
    loading: Boolean
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";
.section {
  margin-top: var(--spacer-base);
}

.carousel {
    margin: 0 calc(var(--spacer-sm) * -1) 0 0;
  @include for-desktop {
    margin: 0;
  }
  &__item {
    margin: 1.9375rem 0 2.4375rem 0;
  }
}

</style>
