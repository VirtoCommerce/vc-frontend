<template>
  <div>
    <div class="highlighted">
      <SfHeading
        :level="3"
        title="Order summary"
        class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    </div>
    <div class="highlighted">
      <!-- TODO: Null reference on first load -->
      <SfProperty
        name="Products"
        :value="cart.itemsCount"
        class="sf-property--full-width sf-property--large property"></SfProperty>
      <SfProperty
        name="Subtotal"
        :value="cart.subTotal | money"
        :class="['sf-property--full-width', 'sf-property--large', { discounted: cart && cart.discountTotal && cart.discountTotal.amount > 0 }]"></SfProperty>
      <SfProperty
        v-for="discount in cart.discounts"
        :key="discount.promotionId"
        :name="discount.description + (discount.coupon && ` (${discount.ccouponode})`)"
        :value="'-' + discount.amount"
        class="sf-property--full-width sf-property--small"></SfProperty>
      <!-- TODO: incorrect special price display -->
      <SfProperty
        v-if="cart && cart.discountTotal && cart.discountTotal.amount > 0"
        :value="cart.total | money"
        class="sf-property--full-width sf-property--small property special-price"></SfProperty>
      <SfProperty
        name="Shipping"
        :value="cart.shippingTotal | money"
        class="sf-property--full-width sf-property--large property"></SfProperty>
      <SfProperty
        name="Total"
        :value="cart.total | money"
        class="sf-property--full-width sf-property--large property-total"></SfProperty>
    </div>
    <div class="highlighted promo-code">
      <SfInput
        v-model="promoCode"
        data-cy="cart-preview-input_promoCode"
        name="promoCode"
        label="Enter promo code"
        class="sf-input--filled promo-code__input"></SfInput>
      <SfButton class="promo-code__button" @click="() => applyCoupon(promoCode)">
        Apply
      </SfButton>
    </div>
    <div class="highlighted">
      <SfCharacteristic
        v-for="characteristic in characteristics"
        :key="characteristic.title"
        :title="characteristic.title"
        :description="characteristic.description"
        :icon="characteristic.icon"
        class="characteristic"></SfCharacteristic>
    </div>
  </div>
</template>

<script>
import { computed, ref, inject, watchEffect } from '@vue/composition-api';
import { useCart } from '@libs/cart';
import {
  SfHeading,
  SfButton,
  SfProperty,
  SfCharacteristic,
  SfInput
} from '@libs/storefrontUI/vue';

export default {
  components: {
    SfHeading,
    SfButton,
    SfProperty,
    SfCharacteristic,
    SfInput
  },


  setup() {
    const listIsHidden = ref(false);
    const promoCode = ref('');
    const showPromoCode = ref(false);

    const { cart } = useCart();

    const applyCoupon = (coupon) => {
      console.log(coupon);
    }

    return {
      cart,
      listIsHidden,
      promoCode,
      showPromoCode,
      applyCoupon,
      characteristics: [
        {
          title: 'Safety',
          description: 'It carefully packaged with a personal touch',
          icon: 'safety'
        },
        {
          title: 'Easy shipping',
          description:
            'You’ll receive dispatch confirmation and an arrival date',
          icon: 'shipping'
        },
        {
          title: 'Changed your mind?',
          description: 'Rest assured, we offer free returns within 30 days',
          icon: 'return'
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";
.highlighted {
  box-sizing: border-box;
  width: 100%;
  background-color: var(--c-light);
  padding: var(--spacer-xl) var(--spacer-xl) 0;
  &:last-child {
    padding-bottom: var(--spacer-xl);
  }
}
.total-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacer-xl);
}
.property {
  margin-bottom: var(--spacer-base);
}
.property-total {
  margin-top: var(--spacer-xl);
  padding-top: var(--spacer-lg);
  font-size: var(--font-size-xl);
  border-top: var(--c-white) 1px solid;
  --property-name-font-weight: var(--font-weight--semibold);
  --property-name-color: var(--c-text);
}

.characteristic {
  &:not(:last-child) {
    margin-bottom: var(--spacer-lg);
  }
}
.promo-code {
  display: flex;
  align-items: flex-start;
  &__button {
    --button-width: 6.3125rem;
    --button-height: var(--spacer-lg);
  }
  &__input {
    --input-background: var(--c-white);
    flex: 1;
  }
}

.discounted {
  &::v-deep .sf-property__value {
    color: var(--c-danger);
    text-decoration: line-through;
  }
}

.special-price {
  justify-content: flex-end;

  &::v-deep .sf-property__name {
    display: none;
  }
}

</style>
