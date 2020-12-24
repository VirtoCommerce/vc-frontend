<template>
  <div>
    <SfHeading
      :level="3"
      title="Billing address"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <div class="form">
      <SfCheckbox
        v-model="sameAsShipping"
        label="Copy address data from shipping"
        name="copyShippingAddress"
        class="form__element"></SfCheckbox>
      <SfInput
        v-model="billingDetails.firstName"
        data-cy="payment-input_firstName"
        label="First name"
        name="firstName"
        class="form__element form__element--half"
        required></SfInput>
      <SfInput
        v-model="billingDetails.lastName"
        data-cy="payment-input_lastName"
        label="Last name"
        name="lastName"
        class="form__element form__element--half form__element--half-even"
        required></SfInput>
      <SfInput
        v-model="billingDetails.streetName"
        data-cy="payment-input_streetName"
        label="Street name"
        name="streetName"
        class="form__element"
        required></SfInput>
      <SfInput
        v-model="billingDetails.apartment"
        data-cy="payment-input_apartment"
        label="House/Apartment number"
        name="apartment"
        class="form__element"
        required></SfInput>
      <SfInput
        v-model="billingDetails.city"
        data-cy="payment-input_"
        label="City"
        name="city"
        class="form__element form__element--half"
        required></SfInput>
      <SfInput
        v-model="billingDetails.state"
        data-cy="payment-input_state"
        label="State/Province"
        name="state"
        class="form__element form__element--half form__element--half-even"
        required></SfInput>
      <SfInput
        v-model="billingDetails.postalCode"
        data-cy="payment-input_postalCode"
        label="Zip-code"
        name="zipCode"
        class="form__element form__element--half"
        required></SfInput>
      <SfSelect
        v-model="billingDetails.country"
        data-cy="payment-select_billingDetails"
        label="Country"
        class="form__element form__element--half form__element--half-even form__select sf-select--underlined"
        required>
        <SfSelectOption
          v-for="countryOption in COUNTRIES"
          :key="countryOption.key"
          :value="countryOption.key">
          {{ countryOption.label }}
        </SfSelectOption>
      </SfSelect>
      <SfInput
        v-model="billingDetails.phone"
        data-cy="payment-input_phone"
        label="Phone number"
        name="phone"
        class="form__element"
        required></SfInput>
    </div>
    <SfHeading
      :level="3"
      title="Payment methods"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <div class="form">
      <div class="form__element payment-methods">
        <SfRadio
          v-for="item in cart.availablePaymentMethods"
          :key="item.code"
          v-model="chosenPaymentMethod"
          data-cy="payment-radio_paymentMethod"
          :label="item.code"
          :value="item.name"
          name="paymentMethod"
          :description="item.name"
          class="form__radio payment-method">
          <template #label>
            <div class="sf-radio__label">
              {{ item.name }}
            </div>
          </template>
        </SfRadio>
      </div>
      <div class="form__action">
        <router-link to="/checkout/personal-details">
          <SfButton data-cy="payment-btn_go-back" class="color-secondary form__back-button">
            Go back
          </SfButton>
        </router-link>
        <router-link to="/checkout/order-review">
          <SfButton data-cy="payment-btn_review"
                    class="form__action-button">
            Pay for order
          </SfButton>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>

import {
  SfHeading,
  SfInput,
  SfButton,
  SfSelect,
  SfRadio,
  SfCheckbox
} from '@storefront-ui/vue';
import { ref, watch, inject } from '@vue/composition-api';

const COUNTRIES = [
  { key: 'US',
    label: 'United States' },
  { key: 'UK',
    label: 'United Kingdom' },
  { key: 'IT',
    label: 'Italy' },
  { key: 'PL',
    label: 'Poland' }
];

export default {
  name: 'Payment',
  components: {
    SfHeading,
    SfInput,
    SfButton,
    SfSelect,
    SfRadio,
    SfCheckbox
  },
  setup(props, context) {

    const billingDetails = ref({});
    const chosenPaymentMethod = ref(null);
    const sameAsShipping = ref(false);
    //Inject cart from parent components
    const cart = inject('cart');

    return {
      cart,
      billingDetails,
      chosenPaymentMethod,
      sameAsShipping,
      COUNTRIES
    };
  }
};

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
.title {
  margin: var(--spacer-xl) 0 var(--spacer-base) 0;
}
.form {
  &__select {
    display: flex;
    align-items: center;
    --select-option-font-size: var(--font-size--lg);
    ::v-deep .sf-select__dropdown {
      font-size: var(--font-size--lg);
      margin: 0;
      color: var(--c-text);
      font-family: var(--font-family--secondary);
      font-weight: var(--font-weight--normal);
    }
  }
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  &__element {
    margin: 0 0 var(--spacer-base) 0;
    @include for-desktop {
      flex: 0 0 100%;
    }
    &--half {
      @include for-desktop {
        flex: 1 1 50%;
      }
      &-even {
        @include for-desktop {
          padding: 0 0 0 var(--spacer-xl);
        }
      }
    }
  }
  &__action {
    @include for-desktop {
      flex: 0 0 100%;
      display: flex;
    }
  }
   &__action-button, &__back-button {
    --button-width: 100%;
    @include for-desktop {
      --button-width: auto;
    }
  }
  &__action-button {
    margin: 0 var(--spacer-xl) 0 0;
  }
  &__back-button {
    margin: 0 0 var(--spacer-sm) 0;
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
  &__radio-group {
    flex: 0 0 100%;
    margin: 0 0 var(--spacer-2xl) 0;
  }
}
.payment-methods {
  @include for-desktop {
    display: flex;
    padding: var(--spacer-lg) 0;
    border: 1px solid var(--c-light);
    border-width: 1px 0;
  }
}
.payment-method {
  --radio-container-align-items: center;
  --ratio-content-margin: 0 0 0 var(--spacer-base);
  --radio-label-font-size: var(--font-size--base);
  --radio-background: transparent;
  white-space: nowrap;
  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;
  &:last-child {
    border-width: 1px 0;
  }
  @include for-desktop {
    border: 0;
    --radio-border-radius: 4px;
  }
}

</style>
