<template>
  <div>
    <SfHeading
      :level="3"
      title="Shipping"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <div class="form">
      <SfInput
        v-model="shippingDetails.firstName"
        data-cy="shipping-details-input_firstName"
        label="First name"
        name="firstName"
        class="form__element form__element--half"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.lastName"
        data-cy="shipping-details-input_lastName"
        label="Last name"
        name="lastName"
        class="form__element form__element--half form__element--half-even"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.streetName"
        data-cy="shipping-details-input_streetName"
        label="Street name"
        name="streetName"
        class="form__element"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.apartment"
        data-cy="shipping-details-input_apartmanet"
        label="House/Apartment number"
        name="apartment"
        class="form__element"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.city"
        data-cy="shipping-details-input_city"
        label="City"
        name="city"
        class="form__element form__element--half"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.state"
        data-cy="shipping-details-input_state"
        label="State/Province"
        name="state"
        class="form__element form__element--half form__element--half-even"
        required></SfInput>
      <SfInput
        v-model="shippingDetails.postalCode"
        data-cy="shipping-details-input_postalCode"
        label="Zip-code"
        name="zipCode"
        class="form__element form__element--half"
        required></SfInput>
      <SfSelect
        v-model="shippingDetails.country"
        data-cy="shipping-details-select_country"
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
        v-model="shippingDetails.phone"
        data-cy="shipping-details-input_phone"
        label="Phone number"
        name="phone"
        class="form__element"
        required></SfInput>
    </div>
    <SfHeading
      :level="3"
      title="Shipping method"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <div class="form">
      <div class="form__radio-group">
        <SfRadio
          v-for="item in cart.availableShippingMethods"
          :key="`${item.code}_${item.optionName}`"
          v-model="chosenShippingMethod"
          :label="`${item.code}(${item.optionName})`"
          :value="`${item.code}_${item.optionName}`"
          name="shippingMethod"
          :description="`${item.code}(${item.optionName})`"
          class="form__radio shipping">
          <template #label="{label}">
            <div class="sf-radio__label shipping__label">
              <div>{{ label }}</div>
              <div>{{ item.price | money }}</div>
            </div>
          </template>
          <template #description="{description}">
            <div class="sf-radio__description shipping__description">
              <div class="shipping__info">
                {{ description }}
              </div>
            </div>
          </template>
        </SfRadio>
      </div>
      <div class="form__action">
        <router-link to="/checkout/personal-details">
          <!-- TODO: add nuxt link for returning to personal details -->
          <SfButton data-cy="shipping-btn_go-back" class="color-secondary form__back-button">
            Go back
          </SfButton>
        </router-link>
        <SfButton data-cy="shipping-btn_continue"
                  class="form__action-button"
                  @click="handleFormSubmit">
          Continue to payment
        </SfButton>
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
  SfRadio
} from '@storefront-ui/vue';
import { computed, ref, inject, watchEffect } from '@vue/composition-api';
//TODO: remove from here
import { useCart } from '@libs/cart';

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
  name: 'PersonalDetails',
  components: {
    SfHeading,
    SfInput,
    SfButton,
    SfSelect,
    SfRadio
  },
  setup(props, context) {

    const { setShipmentDetails } = useCart();
    const shippingDetails = {};
    const chosenShippingMethod = ref(null);
    //Inject cart from parent components
    const cart = inject('cart');

    const handleFormSubmit = (form) => {
      //TODO: move from here to be  decoupled from state
      setShipmentDetails({ deliveryAddress : {...shippingDetails}});
      context.root.$router.push('/checkout/payment');
    };

    return {
      cart,
      handleFormSubmit,
      chosenShippingMethod,
      shippingDetails,
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
  &__group {
    display: flex;
    align-items: center;
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
    margin: 0 0 var(--spacer-2xl) var(--spacer-base);
  }
}
.shipping {
  margin: 0 calc(var(--spacer-xl) * -1);
  &__label {
    display: flex;
    justify-content: space-between;
  }
  &__description {
    --radio-description-margin: 0;
    --radio-description-font-size: var(--font-size--xs);
  }
}

</style>
