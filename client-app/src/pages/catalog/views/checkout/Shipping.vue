<template>
  <div>
    <SfHeading
      :level="3"
      title="Shipping"
      class="sf-heading--left sf-heading--no-underline title"></SfHeading>
    <ValidationObserver v-slot="{ handleSubmit, dirty, reset }">
      <form @submit.prevent="handleSubmit(canContinueToPayment(dirty) ? handleShippingMethodSubmit(reset) : handleShippingAddressSubmit(reset))">
        <UserAddresses
          v-if="isAuthenticated && shippingAddresses && shippingAddresses.length"
          :set-as-default="setAsDefault"
          :user-addresses="shippingAddresses"
          :current-address-id="currentAddressId"
          @setCurrentAddress="setCurrentAddress($event)"
          @changeSetAsDefault="setAsDefault = $event"></UserAddresses>
        <div v-if="canAddNewAddress" class="form">
          <ValidationProvider v-slot="{ errors }"
                              name="firstName"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.firstName"
              label="First name"
              name="firstName"
              class="form__element form__element--half"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="lastName"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.lastName"
              label="Last name"
              name="lastName"
              class="form__element form__element--half form__element--half-even"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="streetName"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.line1"
              label="Street name"
              name="streetName"
              class="form__element form__element--half"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="apartment"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.line2"
              label="House/Apartment number"
              name="apartment"
              class="form__element form__element--half form__element--half-even"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="city"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.city"
              label="City"
              name="city"
              class="form__element form__element--half"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="zipCode"
                              rules="required|min:2"
                              slim>
            <SfInput
              v-model="deliveryAddress.postalCode"
              label="Zip-code"
              name="zipCode"
              class="form__element form__element--half form__element--half-even"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="country"
                              rules="required|min:2"
                              slim>
            <SfSelect
              v-model="deliveryAddress.countryCode"
              label="Country"
              name="country"
              class="form__element form__element--half form__select sf-select--underlined"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"
              @input="countryCode => selectCountry(countryCode)">
              <SfSelectOption
                v-for="countryOption in countries"
                :key="countryOption.key"
                :value="countryOption.key">
                {{ countryOption.label }}
              </SfSelectOption>
            </SfSelect>
          </ValidationProvider>
          <ValidationProvider v-slot="{ errors }"
                              name="phone"
                              rules="required|digits:9"
                              slim>
            <SfInput
              v-model="deliveryAddress.phone"
              label="Phone number"
              name="phone"
              class="form__element form__element--half form__element--half-even"
              required
              :valid="!errors[0]"
              :error-message="errors[0]"></SfInput>
          </ValidationProvider>
        </div>
        <SfButton
          v-if="!canAddNewAddress"
          class="color-light form__action-button form__action-button--add-address"
          type="submit"
          @click.native="canAddNewAddress = true">
          Add new address
        </SfButton>
        <SfHeading
          v-if="canContinueToPayment(dirty)"
          :level="3"
          title="Shipping method"
          class="sf-heading--left sf-heading--no-underline title"></SfHeading>
        <div class="form">
          <div v-if="canContinueToPayment(dirty)" class="form__radio-group">
            <SfRadio
              v-for="item in shippingMethods"
              :key="item.id"
              :label="`${item.code}(${item.optionName})`"
              :value="item.id"
              :selected="chosenShippingMethod.id"
              name="shippingMethod"
              :description="`${item.code}(${item.optionName})`"
              class="form__radio shipping"
              @input="setShippingMethod(item)">
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
            <router-link to="/checkout/personal-details" class="sf-button color-secondary form__back-button">
              Go back
            </router-link>
            <SfButton v-if="canContinueToPayment(dirty)"
                      class="form__action-button"
                      type="submit"
                      :disabled="!isShippingMethodCompleted || loading">
              Continue to payment
            </SfButton>
            <SfButton v-else
                      class="form__action-button"
                      type="submit"
                      :disabled="loading">
              Select shipping method
            </SfButton>
          </div>
        </div>
      </form>
    </ValidationObserver>
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
import { ref, onMounted, computed, watch, reactive } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, min, digits } from 'vee-validate/dist/rules';
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
extend('digits', {
  ...digits,
  message: 'Please provide a valid phone number'
});
export default {
  components: {
    SfHeading,
    SfInput,
    SfButton,
    SfSelect,
    SfRadio,
    UserAddresses,
    ValidationProvider,
    ValidationObserver
  },
  setup(props, context) {
    const {
      loadShipmentMethods,
      deliveryAddress : deliveryAddressRef,
      chosenShippingMethod,
      setDeliveryAddress,
      saveShippingDetails,
      setShippingMethod,
      shippingAddresses,
      setDefaultDeliveryAddress,
      shippingMethods,
      loading
    } = useCheckout();

    //TODO:
    const isAuthenticated = ref(true);
    const isShippingAddressCompleted = ref(true);
    const isShippingMethodCompleted = ref(true);
    const canAddNewAddress = ref(true);
    const addressIsModified = ref(false);
    const currentAddressId = ref('');
    const setAsDefault = ref(false);

    const deliveryAddress = ref({});

    watch(deliveryAddress, () => {
      addressIsModified.value = true;
    });

    const setCurrentAddress = async (addressId) => {
      const chosenAddress = shippingAddresses.value.find(x=> x.id === addressId);
      if (chosenAddress) {
        currentAddressId.value = addressId;
        deliveryAddress.value = { ...chosenAddress };
      }
    };

    onMounted(async () => {
      await loadShipmentMethods();
      //clone delivery address to lose reactivity in order to prevent the state  mutation
      //TODO: need to find a better way to make the state Ref objects trully immutable because if bind the deliveryAddress as v-model
      //the component imput change the deliveryAddress in the state
      deliveryAddress.value = {...deliveryAddressRef.value};

      if (isAuthenticated.value) {
        if (!shippingAddresses.value || !shippingAddresses.value.length) {
          return;
        }
        canAddNewAddress.value = false;
        if (shippingAddresses.value[0].isDefault) {
          setCurrentAddress(shippingAddresses.value[0].id);
        }
      }
    });

    const handleShippingAddressSubmit = (reset) => async () => {

      await setDeliveryAddress(deliveryAddress.value);
      reset();

      if (currentAddressId.value > -1 && setAsDefault.value) {
        const chosenAddress = shippingAddresses.value.find(x=> x.id === currentAddressId.value );
        if (chosenAddress) {
          await setDefaultDeliveryAddress(chosenAddress);
        }
      }
      addressIsModified.value = false;
    };
    const handleShippingMethodSubmit = (reset) => async () => {
      await setShippingMethod(chosenShippingMethod.value);
      await saveShippingDetails();
      reset();
      context.root.$router.push('/checkout/payment');
    };

    const selectCountry = value => {
      const country = COUNTRIES.find( c => c.key === value);
      if(country) {
        deliveryAddress.value.countryCode = country.key;
        deliveryAddress.value.countryName = country.label;
      }
    };

    const canContinueToPayment = dirty => isShippingAddressCompleted.value && !dirty && !addressIsModified.value;

    return {
      loading,
      selectCountry,
      handleShippingAddressSubmit,
      handleShippingMethodSubmit,
      isShippingAddressCompleted,
      isShippingMethodCompleted,
      setShippingMethod,
      deliveryAddress,
      chosenShippingMethod,
      shippingMethods,
      countries: COUNTRIES,
      shippingAddresses,
      canAddNewAddress,
      addressIsModified,
      isAuthenticated,
      currentAddressId: computed(() => currentAddressId.value),
      setAsDefault,
      setCurrentAddress,
      canContinueToPayment
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
  --button-width: 100%;
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
    --button-width: auto;
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
  &__action-button {
    &--secondary {
      @include for-desktop {
        order: -1;
        text-align: left;
      }
    }
    &--add-address {
      width: 100%;
      margin: 0;
      @include for-desktop {
        margin: 0 0 var(--spacer-lg) 0;
        width: auto;
      }
    }
  }
  &__back-button {
    margin: var(--spacer-xl) 0 var(--spacer-sm);
    &:hover {
      color:  var(--c-white);
    }
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
  &__radio-group {
    flex: 0 0 100%;
    margin: 0 0 var(--spacer-xl) 0;
    @include for-desktop {
      margin: 0 0 var(--spacer-2xl) 0;
    }

  }
}
.shipping {
  &__label {
    display: flex;
    justify-content: space-between;
  }
  &__description {
    --radio-description-margin: 0;
    --radio-description-font-size: var(--font-xs);
  }
}
</style>
