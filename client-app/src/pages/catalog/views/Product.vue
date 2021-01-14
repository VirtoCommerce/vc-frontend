<template>
  <div id="product">
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"></SfBreadcrumbs>
    <div class="product">
      <SfGallery :images="productGallery" class="product__gallery"></SfGallery>
      <div class="product__info">
        <div class="product__header">
          <SfHeading
            :title="product.name"
            :level="3"
            class="sf-heading--no-underline sf-heading--left"></SfHeading>
          <SfIcon
            icon="drag"
            size="xxl"
            color="var(--c-text-disabled)"
            class="product__drag-icon smartphone-only"></SfIcon>
        </div>
        <div class="product__price-and-rating">
          <SfPrice
            :regular="product.price.list | price"
            :special="product.price.actual | price(product.price.list)"></SfPrice>
          <div>
            <div class="product__rating">
              <SfRating
                :score="averageRating"
                :max="5"></SfRating>
              <a v-if="!!totalReviews"
                 href="#"
                 class="product__count">
                ({{ totalReviews }})
              </a>
            </div>
            <SfButton data-cy="product-btn_read-all" class="sf-button--text">
              Read all reviews
            </SfButton>
          </div>
        </div>
        <div>
          <p class="product__description desktop-only" v-html="shortDescription">
          </p>
          <SfAddToCart
            v-model="qty"
            data-cy="product-cart_add"
            :stock="stock"
            :disabled="loading"
            :can-add-to-cart="stock > 0"
            class="product__add-to-cart"
            @click="addToCart(product.id, parseInt(qty))"></SfAddToCart>
          <SfButton data-cy="product-btn_save-later" class="sf-button--text desktop-only product__save">
            Save for later
          </SfButton>
          <SfButton data-cy="product-btn_add-to-compare" class="sf-button--text desktop-only product__compare">
            Add to compare
          </SfButton>
        </div>
        <SfTabs :open-tab="1" class="product__tabs">
          <SfTab data-cy="product-tab_description" title="Description">
            <div class="product__description" v-html="fullDescription">
            </div>
          </SfTab>
          <SfTab data-cy="product-tab_description" title="Properties">
            <SfProperty
              v-for="(property, i) in product.properties"
              :key="i"
              :name="property.name"
              :value="property.value"
              class="product__property">
              <template v-if="property.name === 'Category'" #value>
                <SfButton class="product__property__button sf-button--text">
                  {{ property.value }}
                </SfButton>
              </template>
            </SfProperty>
          </SfTab>
          <SfTab
            title="Additional Information"
            data-cy="product-tab_additional"
            class="product__additional-info">
            <div class="product__additional-info">
              <p class="product__additional-info__title">
                Brand
              </p>
              <p>barnd</p>
              <p class="product__additional-info__title">
                Take care of me
              </p>
              <p class="product__additional-info__paragraph">
                Just here for the care instructions?
              </p>
              <p class="product__additional-info__paragraph">
                Yeah, we thought so
              </p>
              <p>Do not wash!</p>
            </div>
          </SfTab>
        </SfTabs>
      </div>
    </div>
    <RelatedProducts v-if="relatedProducts.length > 0"
                     :products="relatedProducts"
                     :loading="loading"
                     title="Match it with"></RelatedProducts>
    <SfBanner
      image="/homepage/bannerD.png"
      subtitle="Fashion to Take Away"
      title="Download our application to your mobile"
      class="sf-banner--left desktop-only banner-app">
      <template #call-to-action>
        <div class="banner-app__call-to-action">
          <SfButton
            class="banner-app__button"
            aria-label="Go to Apple Product"
            @click="() => {}">
            <SfImage
              src="/homepage/apple.png"></SfImage>
          </SfButton>
          <SfButton
            class="banner-app__button"
            aria-label="Go to Google Product"
            @click="() => {}">
            <SfImage
              src="/homepage/google.png"></SfImage>
          </SfButton>
        </div>
      </template>
    </SfBanner>
  </div>
</template>
<script>

import {
  SfProperty,
  SfHeading,
  SfPrice,
  SfRating,
  SfSelect,
  SfAddToCart,
  SfTabs,
  SfGallery,
  SfIcon,
  SfImage,
  SfBanner,
  SfAlert,
  SfSticky,
  SfReview,
  SfBreadcrumbs,
  SfButton,
  SfColor
} from '@storefront-ui/vue';
import { ref, computed, onMounted } from '@vue/composition-api';
import { useCart  } from '@libs/cart';
import { useProducts, RelatedProducts } from '@libs/catalog';
import { productId } from '@core/constants';
import { appendSuffixToFilename } from '@core/utilities';

export default {
  transition: 'fade',
  setup(props, context) {
    const qty = ref(1);
    const breadcrumbs = ref([]);
    const { product, loadProduct, relatedProducts,  fetchRelatedProducts, loading } = useProducts();
    const { addToCart, loading : cartLoading } = useCart();

    const variationProperties = computed(() => product.value.properties.filter(prop => prop.type === 'Variation') );
    const productProperties = computed(() => product.value.properties.filter(prop => prop.type === 'Product') );

    const configuration = computed(() => ['color', 'size']);
    const stock =  computed(() => product.value?.avaibilityData?.availableQuantity);
    const shortDescription =  computed(() => product.value?.descriptions?.find(x=> x.reviewType == "QuickReview")?.content);
    const fullDescription =  computed(() => product.value?.description?.content);

    const productGallery = computed(() => product.value?.images?.slice(0, 3).map(img => ({
      mobile: { url: appendSuffixToFilename(img.url, '_348x348')  },
      desktop: { url:  appendSuffixToFilename(img.url, '_348x348') },
      big: { url: img.url }
    })));

    onMounted(async () => {
      await loadProduct(productId);
      await fetchRelatedProducts(productId);
    });

    const updateFilter = (filter) => {
      context.root.$router.push({
        path: context.root.$route.path,
        query: {
          ...configuration.value,
          ...filter
        }
      });
    };

    return {
      updateFilter,
      configuration,
      product,
      stock,
      fullDescription,
      shortDescription,
      averageRating: 5,
      totalReviews: computed(() => 10 ),
      relatedProducts: computed(() => relatedProducts.value),
      breadcrumbs,
      variationProperties,
      productProperties,
      qty,
      addToCart,
      loading,
      cartLoading,
      productGallery
    };
  },
  components: {
    //SfAlert,
    //SfColor,
    SfProperty,
    SfHeading,
    SfPrice,
    SfRating,
    //SfSelect,
    SfAddToCart,
    SfTabs,
    SfGallery,
    SfIcon,
    SfImage,
    SfBanner,
    //SfSticky,
    //SfReview,
    SfBreadcrumbs,
    SfButton,
    RelatedProducts
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#product {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1272px;
    margin: 0 auto;
  }
}
.product {
  @include for-desktop {
    display: flex;
  }
  &__info {
    margin: var(--spacer-sm) auto;
    @include for-desktop {
      max-width: 32.625rem;
      margin: 0 0 0 7.5rem;
    }
  }
  &__header {
    --heading-title-color: var(--c-link);
    --heading-title-font-weight: var(--font-weight--bold);
    --heading-padding: 0;
    margin: 0 var(--spacer-sm);
    display: flex;
    justify-content: space-between;
    @include for-desktop {
      --heading-title-font-weight: var(--font-weight--semibold);
      margin: 0 auto;
    }
  }
  &__drag-icon {
    animation: moveicon 1s ease-in-out infinite;
  }
  &__price-and-rating {
    margin: 0 var(--spacer-sm) var(--spacer-base);
    align-items: center;
    @include for-desktop {
      display: flex;
      justify-content: space-between;
      margin: var(--spacer-sm) 0 var(--spacer-lg) 0;
    }
  }
  &__rating {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin: var(--spacer-xs) 0 var(--spacer-xs);
  }
  &__count {
    @include font(
      --count-font,
      var(--font-weight--normal),
      var(--font-size--sm),
      1.4,
      var(--font-family--secondary)
    );
    color: var(--c-text);
    text-decoration: none;
    margin: 0 0 0 var(--spacer-xs);
  }
  &__description {
    @include font(
      --product-description-font,
      var(--font-weight--light),
      var(--font-size--base),
      1.6,
      var(--font-family--primary)
    );
  }
  &__select-size {
    margin: 0 var(--spacer-sm);
    @include for-desktop {
      margin: 0;
    }
  }
  &__colors {
    @include font(
      --product-color-font,
      var(--font-weight--normal),
      var(--font-size--lg),
      1.6,
      var(--font-family--secondary)
    );
    display: flex;
    align-items: center;
    margin-top: var(--spacer-xl);
  }
  &__color-label {
    margin: 0 var(--spacer-lg) 0 0;
  }
  &__color {
    margin: 0 var(--spacer-2xs);
  }
  &__add-to-cart {
    margin: var(--spacer-base) var(--spacer-sm) 0;
    @include for-desktop {
      margin-top: var(--spacer-2xl);
    }
  }
  &__guide,
  &__compare,
  &__save {
    display: block;
    margin: var(--spacer-xl) 0 var(--spacer-base) auto;
  }
  &__compare {
    margin-top: 0;
  }
  &__tabs {
    margin: var(--spacer-lg) auto var(--spacer-2xl);
    --tabs-title-font-size: var(--font-size--lg);
    @include for-desktop {
      margin-top: var(--spacer-2xl);
    }
  }
  &__property {
    margin: var(--spacer-base) 0;
    &__button {
      --button-font-size: var(--font-size--base);
    }
  }
  &__review {
    padding-bottom: 24px;
    border-bottom: var(--c-light) solid 1px;
    margin-bottom: var(--spacer-base);
  }
  &__additional-info {
    color: var(--c-link);
    @include font(
      --additional-info-font,
      var(--font-weight--light),
      var(--font-size--sm),
      1.6,
      var(--font-family--primary)
    );
    &__title {
      font-weight: var(--font-weight--normal);
      font-size: var(--font-size--base);
      margin: 0 0 var(--spacer-sm);
      &:not(:first-child) {
        margin-top: 3.5rem;
      }
    }
    &__paragraph {
      margin: 0;
    }
  }
  &__gallery {
    flex: 1;
  }
}
.breadcrumbs {
  margin: var(--spacer-base) auto var(--spacer-lg);
}
.banner-app {
  --banner-container-width: 100%;
  --banner-title-margin: var(--spacer-base) 0 var(--spacer-xl) 0;
  --banner-padding: 0 var(--spacer-2xl);
  --banner-title-font-size: var(--h1-font-size);
  --banner-subtitle-font-size: var(--font-size--xl);
  --banner-title-font-weight: var(--font-weight--semibold);
  --banner-subtitle-font-weight: var(--font-weight--medium);
  --banner-title-text-transform: capitalize;
  --banner-subtitle-text-transform: capitalize;
  display: block;
  min-height: 26.25rem;
  max-width: 65rem;
  margin: 0 auto;
  padding: 0 calc(25% + var(--spacer-2xl)) 0 var(--spacer-xl);
  &__call-to-action {
    --button-background: transparent;
    display: flex;
  }
  &__button {
    --image-width: 8.375rem;
    --image-height: 2.75rem;
    --button-padding: 0;
    & + & {
      margin: 0 0 0 calc(var(--spacer-xl) / 2);
    }
  }
}
@keyframes moveicon {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 30%, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}
</style>
