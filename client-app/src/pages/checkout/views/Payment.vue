<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(addressIsModified ? handleBillingAddressSubmit : handleFormSubmit)">
      <SfHeading
        :level="3"
        title="Billing address"
        class="sf-heading--left sf-heading--no-underline title"></SfHeading>
      <UserAddresses
        v-if="isAuthenticated && billingAddresses && billingAddresses.length"
        :set-as-default="setAsDefault"
        :user-addresses="billingAddresses"
        :current-address-id="currentAddressId"
        @setCurrentAddress="setCurrentAddress($event)"
        @changeSetAsDefault="setAsDefault = $event"></UserAddresses>
      <SfCheckbox
        :selected="sameAsShipping"
        label="Copy address data from shipping"
        name="copyShippingAddress"
        class="form__element"
        @change="handleCheckSameAddress"></SfCheckbox>
      <div v-if="canAddNewAddress" class="form">
        <ValidationProvider v-slot="{ errors }"
                            name="firstName"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.firstName"
            label="First name"
            name="firstName"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="firstName => setBillingDetailsAndUnpickAddress({ firstName })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="lastName"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.lastName"
            label="Last name"
            name="lastName"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="lastName => setBillingDetailsAndUnpickAddress({ lastName })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="streetName"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.streetName"
            label="Street name"
            name="streetName"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="streetName => setBillingDetailsAndUnpickAddress({ streetName })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="apartment"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.streetNumber"
            label="House/Apartment number"
            name="apartment"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="streetNumber => setBillingDetailsAndUnpickAddress({ streetNumber })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="city"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.city"
            label="City"
            name="city"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="city => setBillingDetailsAndUnpickAddress({ city })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="zipCode"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.postalCode"
            label="Zip-code"
            name="zipCode"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="postalCode => setBillingDetailsAndUnpickAddress({ postalCode })"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="country"
                            rules="required|min:2"
                            slim>
          <SfSelect
            :selected="billingAddress.country"
            label="Country"
            class="form__element form__element--half form__select sf-select--underlined"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @change="country => setBillingDetailsAndUnpickAddress({ country })">
            <SfSelectOption
              v-for="countryOption in COUNTRIES"
              :key="countryOption.key"
              :value="countryOption.key">
              {{ countryOption.label }}
            </SfSelectOption>
          </SfSelect>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            name="phone"
                            rules="required|min:2"
                            slim>
          <SfInput
            :value="billingAddress.phone"
            label="Phone number"
            name="phone"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="phone => setBillingDetailsAndUnpickAddress({ phone } )"></SfInput>
        </ValidationProvider>
      </div>
      <SfButton
        v-if="!canAddNewAddress"
        class="form__action-button form__action-button--margin-bottom"
        type="submit"
        @click.native="canAddNewAddress = true">
        Add new address
      </SfButton>
      <SfHeading
        v-if="canContinueToReview"
        :level="3"
        title="Payment methods"
        class="sf-heading--left sf-heading--no-underline title"></SfHeading>
      <div class="form">
        <div v-if="canContinueToReview" class="form__element payment-methods">
          <SfRadio
            v-for="item in paymentMethods"
            :key="item.code"
            :selected="chosenPaymentMethod.code"
            :label="item.name"
            :value="item.code"
            name="paymentMethod"
            :description="item.name"
            class="form__radio payment-method"
            @input="setPaymentMethod(item)">
            <template #label>
              <div class="sf-radio__label">
                {{ item.label }}
              </div>
            </template>
          </SfRadio>
        </div>
        <div class="form__action">
          <router-link to="/shipping" class="sf-button color-secondary form__back-button">
            Go back
          </router-link>
          <SfButton v-if="canContinueToReview"
                    class="form__action-button"
                    type="submit"
                    :disabled="loading">
            Review my order
          </SfButton>
          <SfButton v-else
                    class="form__action-button"
                    type="submit"
                    :disabled="loading">
            Select payment method
          </SfButton>
        </div>
      </div>
    </form>
  </ValidationObserver>
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
import { ref, computed, onMounted } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, min } from 'vee-validate/dist/rules';
import { UserAddresses , useCheckout } from '@libs/checkout';

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
extend('required', {
  ...required,
  message: 'This field is required'
});
extend('min', {
  ...min,
  message: 'The field should have at least {length} characters'
});
export default {
  name: 'Payment',
  components: {
    SfHeading,
    SfInput,
    SfButton,
    SfSelect,
    SfRadio,
    SfCheckbox,
    UserAddresses,
    ValidationProvider,
    ValidationObserver
  },
  setup(props, context) {

    const {
      loadPaymentMethods,
      billingAddress,
      deliveryAddress,
      chosenPaymentMethod,
      setBillingAddress,
      setPaymentMethod,
      setDefaultBillingAddress,
      saveBillingDetails,
      paymentMethods,
      billingAddresses,
      loading
    } = useCheckout();

    const isAuthenticated = ref(true);
    const isBillingAddressCompleted = ref(true);
    const canAddNewAddress = ref(true);
    const addressIsModified = ref(false);
    const currentAddressId = ref('');
    const setAsDefault = ref(false);

    const sameAsShipping = ref(false);
    let oldBilling = null;


    const setCurrentAddress = async (addressId) => {
      const chosenAddress = billingAddresses.value.find(x=> x.id === addressId);
      if (chosenAddress) {
        currentAddressId.value = addressId;
        setBillingAddress(chosenAddress);
        addressIsModified.value = true;
        sameAsShipping.value = false;
      }
    };

    onMounted(async () => {
      await loadPaymentMethods();

      if (isAuthenticated.value) {
        if (!billingAddresses.value || !billingAddresses.value.length) {
          return;
        }
        canAddNewAddress.value = false;
        if (billingAddresses.value[0].isDefault) {
          setCurrentAddress(billingAddresses.value[0].id);
        }
      }

    });

    const handleFormSubmit = async () => {
      await setBillingAddress(billingAddress.value);
      context.root.$router.push('/order-review');
    };

    const handleBillingAddressSubmit = async () => {
      await setBillingAddress(billingAddress.value);
      await saveBillingDetails();
      addressIsModified.value = false;
    };

    const handleCheckSameAddress = () => {
      sameAsShipping.value = !sameAsShipping.value;
      if (sameAsShipping.value) {
        oldBilling = billingAddress.value;
        setBillingAddress(deliveryAddress.value);
        currentAddressId.value = -1;
        setAsDefault.value = false;
        addressIsModified.value = true;
        return;
      }
      setBillingAddress(oldBilling);
    };

    const setBillingDetailsAndUnpickAddress = value => {
      setBillingAddress(value);
      currentAddressId.value = -1;
      addressIsModified.value = true;
      sameAsShipping.value = false;
    };

    return {
      loading,
      billingAddress,
      paymentMethods,
      chosenPaymentMethod,
      sameAsShipping,
      COUNTRIES,
      setPaymentMethod,
      handleFormSubmit,
      handleBillingAddressSubmit,
      handleCheckSameAddress,
      isAuthenticated,
      billingAddresses,
      setAsDefault,
      canContinueToReview: computed(() => isBillingAddressCompleted.value && !addressIsModified.value),
      currentAddressId,
      setCurrentAddress,
      addressIsModified,
      setBillingDetailsAndUnpickAddress,
      canAddNewAddress
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
    margin: 0 0 var(--spacer-xl) 0;
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
    &--secondary {
      @include for-desktop {
        order: -1;
        --button-margin: 0;
        text-align: left;
      }
    }
  }
  &__back-button {
    margin: var(--spacer-xl) 0 var(--spacer-sm);
    &:hover {
      color:  white;
    }
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
  &__back-button {
    margin: 0 0 var(--spacer-sm) 0;
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
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
  --radio-label-font-size: var(--font-base);
  --radio-background: transparent;
  white-space: nowrap;
  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;
  &:last-child {
    border-width: 1px 0;
  }
  --radio-background: transparent;
  @include for-desktop {
    border: 0;
    --radio-border-radius: 4px;
  }
}
</style>
