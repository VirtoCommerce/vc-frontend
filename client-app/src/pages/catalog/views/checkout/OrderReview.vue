<template>
  <div>
    <SfHeading
      :level="3"
      title="Order details"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <SfAccordion first-open class="accordion smartphone-only">
      <SfAccordionItem header="Personal Details">
        <div class="accordion__item">
          <div class="accordion__content">
            <p class="content">
              {{ personalDetails.firstName }} {{ personalDetails.lastName }}<br>
            </p>
            <p class="content">
              {{ personalDetails.email }}
            </p>
          </div>
          <SfButton class="sf-button--text color-secondary accordion__edit" @click="$emit('click:edit', 0)">
            Edit
          </SfButton>
        </div>
      </SfAccordionItem>
      <SfAccordionItem header="Shipping address">
        <div class="accordion__item">
          <div class="accordion__content">
            <p class="content">
              <span class="content__label">{{ chosenShippingMethod.name }}</span><br>
              {{ deliveryAddress.line1 }} {{ deliveryAddress.line2 }},
              {{ deliveryAddress.zipCode }}<br>
              {{ deliveryAddress.city }}, {{ deliveryAddress.country }}
            </p>
            <p class="content">
              {{ deliveryAddress.phoneNumber }}
            </p>
          </div>
          <SfButton class="sf-button--text color-secondary accordion__edit" @click="$emit('click:edit', 1)">
            Edit
          </SfButton>
        </div>
      </SfAccordionItem>
      <SfAccordionItem header="Billing address">
        <div class="accordion__item">
          <div class="accordion__content">
            <p v-if="billingSameAsShipping" class="content">
              Same as shipping address
            </p>
            <template v-else>
              <p class="content">
                <span class="content__label">{{ chosenPaymentMethod.name }}</span><br>
                {{ billingAddress.line1 }} {{ billingAddress.line2 }},
                {{ billingAddress.zipCode }}<br>
                {{ billingAddress.city }}, {{ billingAddress.country }}
              </p>
              <p class="content">
                {{ billingAddress.phoneNumber }}
              </p>
            </template>
          </div>
          <SfButton class="sf-button--text color-secondary accordion__edit" @click="$emit('click:edit', 2)">
            Edit
          </SfButton>
        </div>
      </SfAccordionItem>
      <SfAccordionItem header="Payment method">
        <div class="accordion__item">
          <div class="accordion__content">
            <p class="content">
              {{ chosenPaymentMethod.name }}
            </p>
          </div>
          <SfButton class="sf-button--text color-secondary accordion__edit" @click="$emit('click:edit', 2)">
            Edit
          </SfButton>
        </div>
      </SfAccordionItem>
    </SfAccordion>
    <SfTable class="sf-table--bordered table desktop-only">
      <SfTableHeading class="table__row">
        <SfTableHeader class="table__header table__image">
          Item
        </SfTableHeader>
        <SfTableHeader
          v-for="tableHeader in tableHeaders"
          :key="tableHeader"
          class="table__header"
          :class="{ table__description: tableHeader === 'Description' }">
          {{ tableHeader }}
        </SfTableHeader>
      </SfTableHeading>
      <SfTableRow
        v-for="(lineItem, index) in cart.items"
        :key="index"
        class="table__row">
        <SfTableData class="table__image">
          <SfImage :src="lineItem.imageUrl"></SfImage>
        </SfTableData>
        <SfTableData class="table__data table__description table__data">
          <div class="product-title">
            {{ lineItem.name }}
          </div>
          <div class="product-sku">
            {{ lineItem.code }}
          </div>
        </SfTableData>
        <SfTableData class="table__data">
          {{ lineItem.quantity }}
        </SfTableData>
        <SfTableData class="table__data price">
          <SfPrice
            :regular="lineItem.listPrice | money"
            :special="lineItem.extendedPrice | money"
            class="product-price"></SfPrice>
        </SfTableData>
      </SfTableRow>
    </SfTable>
    <div class="summary">
      <div class="summary__group">
        <div class="summary__total">
          <SfProperty
            name="Subtotal"
            :value="cart.subTotal | money"
            class="sf-property--full-width property"></SfProperty>
          <SfProperty
            name="Shipping"
            :value="cart.shippingTotal | money"
            class="sf-property--full-width property"></SfProperty>
        </div>
        <SfDivider></SfDivider>
        <SfProperty
          name="Total price"
          :value="cart.total | money"
          class="sf-property--full-width sf-property--large summary__property-total"></SfProperty>
        <SfCheckbox v-model="terms"
                    name="terms"
                    class="summary__terms">
          <template #label>
            <div class="sf-checkbox__label">
              I agree to <SfLink href="#">
                Terms and conditions
              </SfLink>
            </div>
          </template>
        </SfCheckbox>
        <div class="summary__action">
          <router-link to="/checkout/payment" class="sf-button color-secondary summary__back-button">
            Go back
          </router-link>
          <SfButton class="summary__action-button"
                    :disabled="loading"
                    @click="processOrder">
            Make an order
          </SfButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  SfHeading,
  SfTable,
  SfCheckbox,
  SfButton,
  SfDivider,
  SfImage,
  SfPrice,
  SfProperty,
  SfAccordion,
  SfLink
} from '@storefront-ui/vue';
import { ref, computed, onMounted} from '@vue/composition-api';
import { useCart } from '@libs/cart';
import { useCheckout } from '@libs/checkout';

export default {
  name: 'ReviewOrder',
  components: {
    SfHeading,
    SfTable,
    SfCheckbox,
    SfButton,
    SfDivider,
    SfImage,
    SfPrice,
    SfProperty,
    SfAccordion,
    SfLink
  },
  setup(props, context) {
    const billingSameAsShipping = ref(false);
    const terms = ref(false);
    const { cart, removeFromCart, loadMyCart } = useCart();

    const {
      placeOrder,
      deliveryAddress,
      billingAddress,
      chosenShippingMethod,
      chosenPaymentMethod,
      loading,
      clean
    } = useCheckout();


    const personalDetails = computed(()=> { return {  ...deliveryAddress.value } } );

    onMounted(async () => {
      await loadMyCart();
    });

    const processOrder = async () => {
      const order = await placeOrder(cart.value.id);
      context.root.$router.push(`/checkout/thank-you?order=${order.number}`);
      clean();
    };
    return {
      cart,
      loading,
      personalDetails,
      deliveryAddress,
      billingAddress,
      chosenShippingMethod,
      chosenPaymentMethod,
      billingSameAsShipping,
      terms,
      removeFromCart,
      processOrder,
      tableHeaders: ['Description', 'Colour', 'Size', 'Quantity', 'Amount']
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
.title {
  margin: var(--spacer-xl) 0 var(--spacer-base) 0;
}
.table {
  margin: 0 0 var(--spacer-base) 0;
  &__row {
    justify-content: space-between;
  }
  @include for-desktop {
    &__header {
      text-align: center;
      &:last-child {
        text-align: right;
      }
    }
    &__data {
      text-align: center;
    }
    &__description {
      text-align: left;
      flex: 0 0 12rem;
    }
    &__image {
      --image-width: 5.125rem;
      text-align: left;
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
}
.product-sku {
  color: var(--c-text-muted);
  font-size: var(--font-size--sm);
}
.price {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}
.product-price {
  --price-font-size: var(--font-size--base);
}
.summary {
  &__group {
    @include for-desktop {
      margin: 0 0 var(--spacer-2xl) 0;
    }
  }
  &__terms {
    margin: var(--spacer-base) 0 0 0;
  }
  &__total {
    margin: 0 0 var(--spacer-sm) 0;
    flex: 0 0 16.875rem;
  }
  &__action {
    @include for-desktop {
      display: flex;
      margin: var(--spacer-xl) 0 0 0;
    }
  }
  &__action-button {
    margin: 0;
    width: 100%;
    margin: var(--spacer-sm) 0 0 0;
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
      width: auto;
    }
    &--secondary {
      @include for-desktop {
        text-align: right;
      }
    }
  }
  &__back-button {
    margin: var(--spacer-xl) 0 0 0;
    width: 100%;
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
      width: auto;
    }
    color:  var(--c-white);
    &:hover {
      color:  var(--c-white);
    }
  }
  &__property-total {
    margin: var(--spacer-xl) 0 0 0;
  }
}
.property {
  margin: 0 0 var(--spacer-sm) 0;
  &__name {
    color: var(--c-text-muted);
  }
}
.accordion {
  margin: 0 0 var(--spacer-xl) 0;
  &__item {
    display: flex;
    align-items: flex-start;
  }
  &__content {
    flex: 1;
  }
  &__edit {
    flex: unset;
  }
}
.content {
  margin: 0 0 var(--spacer-xl) 0;
  color: var(--c-text);
  &:last-child {
    margin: 0;
  }
  &__label {
    font-weight: var(--font-weight--normal);
  }
}
</style>
