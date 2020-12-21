<template>
  <div id="cart">
    <SfSidebar
      :visible="visible"
      title="My Cart"
      class="sf-sidebar--right"
      @close="onClose">
      <template #content-top>
        <SfProperty
          v-if="cart"
          class="sf-property--large cart-summary desktop-only"
          name="Total items"
          :value="cart.itemsQuantity"></SfProperty>
      </template>
      <transition name="sf-fade" mode="out-in">
        <div v-if="cart"
             key="my-cart"
             class="my-cart">
          <div class="collected-product-list">
            <transition-group name="sf-fade" tag="div">
              <SfCollectedProduct
                v-for="item in cart.items"
                :key="item.id"
                data-cy="collected-product-cart-sidebar"
                :image="item.imageUrl"
                :title="item.name"
                :regular-price="item.listPrice | price"
                :special-price="item.extendedPrice | price"
                :stock="99999"
                :qty="item.quantity"
                class="collected-product"
                @input="updateQuantity(item, $event)"
                @click:remove="removeFromCart(item)">
                <template #actions>
                  <div class="desktop-only collected-product__actions">
                    <SfButton class="sf-button--text collected-product__save">
                      Save for later
                    </SfButton>
                    <SfButton
                      class="sf-button--text collected-product__compare">
                      Add to compare
                    </SfButton>
                  </div>
                </template>
              </SfCollectedProduct>
            </transition-group>
          </div>
        </div>
        <div v-else
             key="empty-cart"
             class="empty-cart">
          <div class="empty-cart__banner">
            <SfImage
              alt="Empty bag"
              class="empty-cart__image"
              src="/icons/empty-cart.svg"></SfImage>
            <SfHeading
              title="Your cart is empty"
              :level="2"
              class="empty-cart__heading"
              description="Looks like you haven’t added any items to the bag yet. Start
              shopping to fill it in."></SfHeading>
          </div>
        </div>
      </transition>
      <template #content-bottom>
        <transition name="sf-fade">
          <div v-if="cart.itemsQuantity">
            <SfProperty
              name="Total price"
              class="sf-property--full-width sf-property--large my-cart__total-price">
              <template #value>
                <SfPrice :regular="cart.total | price"></SfPrice>
              </template>
            </SfProperty>

            <SfButton
              class="sf-button--full-width color-secondary"
              @click="onClose">
              Go to checkout
            </SfButton>
          </div>
          <div v-else>
            <SfButton
              class="sf-button--full-width color-primary"
              @click="onClose">
              Go back shopping
            </SfButton>
          </div>
        </transition>
      </template>
    </SfSidebar>
  </div>
</template>

<script>
import Vue from "vue";
import {
  SfSidebar,
  SfHeading,
  SfButton,
  SfIcon,
  SfProperty,
  SfPrice,
  SfCollectedProduct,
  SfImage
} from '@storefront-ui/vue';
import { computed, onMounted, ref } from '@vue/composition-api';
import { CartType } from '@core/api/graphql/types';

export default {
  components: {
    SfSidebar,
    SfButton,
    SfHeading,
    SfProperty,
    SfPrice,
    SfCollectedProduct,
    SfImage
  },
  props:
  {
    cart: {
      type: Object,
      "default": null
    },
    visible: {
      type: Boolean,
      "default": false
    }
  },
  computed: {
  },
  methods: {
    onClose() {
      this.$emit("onClose");
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#cart {
  @include for-desktop {
    & > * {
      --sidebar-bottom-padding: var(--spacer-base);
      --sidebar-content-padding: var(--spacer-base);
    }
  }
}
.cart-summary {
  margin-top: var(--spacer-xl);
}
.my-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  &__total-items {
    margin: 0;
  }
  &__total-price {
    --price-font-size: var(--font-size--xl);
    --price-font-weight: var(--font-weight--medium);
    margin: 0 0 var(--spacer-base) 0;
  }
}
.empty-cart {
  --heading-description-margin: 0 0 var(--spacer-xl) 0;
  --heading-title-margin: 0 0 var(--spacer-xl) 0;
  --heading-title-color: var(--c-primary);
  --heading-title-font-weight: var(--font-weight--semibold);
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  &__banner {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }
  &__heading {
    padding: 0 var(--spacer-base);
  }
  &__image {
    --image-width: 13.1875rem;
    margin: 0 0 var(--spacer-xl) 7.5rem;
    @include for-desktop {
      --image-width: 23.3125rem;
      margin: 0 0 var(--spacer-2xl) 7.5rem;
    }
  }
  @include for-desktop {
    --heading-title-font-size: var(--font-size--xl);
    --heading-title-margin: 0 0 var(--spacer-sm) 0;
  }
}
.collected-product-list {
  flex: 1;
}
.collected-product {
  margin: 0 0 var(--spacer-sm) 0;
  --image-height: 12.5rem;
  &__properties {
    margin: var(--spacer-xs) 0 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    flex: 2;
    &:first-child {
      margin-bottom: 8px;
    }
  }
  &__actions {
    transition: opacity 150ms ease-in-out;
  }
  &__save,
  &__compare {
    --button-padding: 0;
    &:focus {
      --cp-save-opacity: 1;
      --cp-compare-opacity: 1;
    }
  }
  &__save {
    opacity: var(--cp-save-opacity, 0);
  }
  &__compare {
    opacity: var(--cp-compare-opacity, 0);
  }
  &:hover {
    --cp-save-opacity: 1;
    --cp-compare-opacity: 1;
    @include for-desktop {
      .collected-product__properties {
        display: none;
      }
    }
  }
}
</style>
