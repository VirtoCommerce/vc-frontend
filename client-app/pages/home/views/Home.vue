<template>
  <div id="home">
    <SfSection background="#f0efee">
      <SfHero>
        <SfHeroItem
          v-for="(hero, i) in heroes"
          :key="i"
          :title="hero.title"
          :subtitle="hero.subtitle"
          :button-text="hero.buttonText"
          :background="hero.background"
          :image="hero.image | assetUrl"
          :class="hero.className" />
      </SfHero>
    </SfSection>

    <SfSection>
      <div class="section__banners">
        <SfCard
          v-for="(item, index) in banners"
          :key="index"
          :description="item.description"
          :title="item.title"
          :image="item.image | assetUrl" />
      </div>
    </SfSection>

    <SfSection background="#F8F6F7" class="sections-quote">
      <div class="sections-quote__content">
        <div class="sections-quote__col">
          <SfImage :src="'images/homepage/image5.png' | assetUrl" />
        </div>

        <div class="sections-quote__col">
          <div style="padding: 3rem">
            The collection features formal and casual comfort shoes with a Danish design focus.
            Made from premium leathers and comfort.
          </div>
          <SfButton style="margin: 0 auto 2rem">
            Get a quote
          </SfButton>
        </div>
      </div>
    </SfSection>

    <SfSection>
      <div class="similar-products">
        <SfHeading title="Shop Series by Type" :level="3"></SfHeading>
        <a href="#">
          shop all subcategories
        </a>
      </div>

      <SfCarousel class="carousel" :settings="{ peek: 16, breakpoints: { 1023: { peek: 0, perView: 2 } } }">
        <template #prev="{go}">
          <SfArrow
            aria-label="prev"
            class="sf-arrow--left"
            @click="go('prev')" />
        </template>
        <template #next="{go}">
          <SfArrow
            aria-label="next"
            class="sf-arrow--right"
            @click="go('next')" />
        </template>
        <SfCarouselItem
          v-for="(product, i) in products"
          :key="i"
          class="carousel__item">
          <SfProductCard
            data-cy="home-url_product"
            :title="product.title"
            :image="product.image | assetUrl"
            :regular-price="product.price.regular"
            :max-rating="product.rating.max"
            :score-rating="product.rating.score"
            :show-add-to-cart-button="true"
            :is-on-wishlist="product.isOnWishlist"
            link="/"
            class="carousel__item__product"
            @click:wishlist="toggleWishlist(i)" />
        </SfCarouselItem>
      </SfCarousel>
    </SfSection>

    <cp-introducing
      :image="'images/homepage/rectangle2257.png' | assetUrl"
      background="#F8F6F7"
      button-text="SHOP THE OE SERIES"
      title="The OE Series Open-End Thread Protectors"
      sub-title="INTRODUCING"
      description="The OE series pipe caps shield threaded pipes and conduits during shipping, storage, and transit.
                   Availablewith tear ring Grip it & Rop It design and without." />

    <cp-materials
      title="High Performance Materials"
      description="virtocommerce offers parts in both low density polyethylene and high density
                   polyethylene to keep fabricated components free from damage."
      banner-description="Read how to take care of your baby, see our products avaiablable,
                          clothes and suggestions how stay healthy."
      button-text="view material data chart"
      banner-link-text="Material by Temperature"
      banner-link="#"
      :banner-image="'images/sugar.jpeg' | assetUrl"
      :items="['Low-density polyethylene', 'FlexTemp', 'Vinyl', 'Steel & zinc plate', 'Steel & zinc plate',
               'Neoprene', 'Neoprene', 'FlexTemp', 'Low-density polyethylene', 'Vinyl']"
    />

    <cp-solutions
      title="We offer injection molding solutions for unique challenges"
      subtitle="CUSTOM SOLUTIONS"
      :items="solutions"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import {
  SfButton,
  SfImage,
  SfSection,
  SfHero,
  SfCard,
  SfCarousel,
  SfProductCard,
  SfHeading,
  SfArrow,
  CpIntroducing,
  CpMaterials,
  CpSolutions
} from '@libs/storefrontUI/vue';

export default {
  name: 'Home',
  components: {
    SfButton,
    SfImage,
    SfSection,
    SfHero,
    SfCard,
    SfCarousel,
    SfProductCard,
    SfHeading,
    SfArrow,
    CpIntroducing,
    CpMaterials,
    CpSolutions
  },
  data() {
    const assetUrl = Vue.filter('assetUrl');

    return {
      heroes: [
        {
          title: 'Largest Catalog in the Industry',
          subtitle: 'PLASTIC CAPS',
          buttonText: 'Geta quote',
          image: 'images/homepage/banner.png',
          link: '/c/women/women-clothing-shirts'
        }
      ],
      banners: [
        {
          title: 'Seal out dust and moisture',
          description: 'Keep your products free from damage and contaminants long after they leave your facility.',
          image: 'images/homepage/image3.png'
        },
        {
          title: 'Protect delicate instruments',
          description: 'Secure devices, ports, components, and instruments during shipping and storage.',
          image: 'images/homepage/image1.png'
        },
        {
          title: 'Save production time',
          description: 'A variety of patented, ergonomic designs allow for faster installation and removal.',
          image: 'images/homepage/image2.png'
        }
      ],
      products: [
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: true
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-1.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-2.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-3.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-4.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-2.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-1.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        },
        {
          title: 'Cream Beach Bag',
          image: 'images/homepage/image4-4.png',
          price: { regular: '50.00 $' },
          rating: { max: 5, score: 4 },
          isOnWishlist: false
        }
      ],
      solutions: [
        {
          name: 'Molding capabilities',
          imageUrl: 'images/solution-1.jpeg'
        },
        {
          name: 'Design a part',
          imageUrl: 'images/solution-2.jpeg'
        },
        {
          name: 'Get a quote',
          imageUrl: 'images/solution-3.jpeg'
        }
      ].map((item) => ({ ...item, imageUrl: assetUrl(item.imageUrl) }))
    };
  },
  methods: {
    toggleWishlist(index) {
      this.products[index].isOnWishlist = !this.products[index].isOnWishlist;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/helpers";

::v-deep .sf-hero__controls {
  --hero-controls-display: none;
}

.banner {
  &-central {
    @include for-desktop {
      --banner-container-flex: 0 0 70%;
    }
  }
}

.section__banners {
  display: flex;
  justify-content: space-between;
  margin: 3rem 0;

  @include for-mobile {
    flex-direction: column;
  }
}

.sections-quote {
  padding: 4rem 0;

  &__content {
    background: white;
    border-radius: 3px;
    border-top: 3px solid var(--c-primary);
    display: flex;
    justify-content: space-between;

    @include for-mobile {
      flex-direction: column;
    }
  }

  &__col {
    --image-width: 100%;
    width: 50%;

    @include for-mobile {
      width: 100%;
    }
  }
}

.similar-products {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacer-xl) 0;
  --heading-padding: 0;
  border-bottom: 1px var(--c-light) solid;
  @include for-desktop {
    border-bottom: 0;
    padding-bottom: 0;
  }
}

.carousel {
    margin: 0 calc(var(--spacer-sm) * -1) 0 0;
  @include for-desktop {
    margin: 0;
  }
  &__item {
    margin: 1.375rem 0 2.5rem 0;
    @include for-desktop {
      margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
    }
    &__product {
      --product-card-add-button-transform: translate3d(0, 30%, 0);
    }
  }
}

</style>
