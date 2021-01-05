<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <form
      id="billing-details-form"
      class="form"
      @submit.prevent="handleSubmit(submitForm)">
      <div class="form__horizontal">
        <ValidationProvider
          v-slot="{ errors }"
          rules="required|min:2"
          class="form__element">
          <SfInput
            v-model="form.firstName"
            data-cy="billing-details-input_firstName"
            name="firstName"
            label="First Name"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          rules="required|min:2"
          class="form__element">
          <SfInput
            v-model="form.lastName"
            data-cy="billing-details-input_lastName"
            name="lastName"
            label="Last Name"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
      </div>
      <ValidationProvider
        v-slot="{ errors }"
        rules="required|min:5"
        class="form__element">
        <SfInput
          v-model="form.streetName"
          data-cy="billing-details-input_streetName"
          name="streetName"
          label="Street Name"
          required
          :valid="!errors[0]"
          :error-message="errors[0]"></SfInput>
      </ValidationProvider>
      <SfInput
        v-model="form.apartment"
        data-cy="billing-details-input_apartment"
        name="apartment"
        label="House/Apartment number"
        required
        class="form__element"></SfInput>
      <div class="form__horizontal">
        <ValidationProvider
          v-slot="{ errors }"
          rules="required|min:2"
          class="form__element">
          <SfInput
            v-model="form.city"
            data-cy="billing-details-input_city"
            name="city"
            label="City"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          rules="required|min:2"
          class="form__element">
          <SfInput
            v-model="form.state"
            data-cy="billing-details-input_state"
            name="state"
            label="State/Province"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
      </div>
      <div class="form__horizontal">
        <ValidationProvider
          v-slot="{ errors }"
          rules="required|min:4"
          class="form__element">
          <SfInput
            v-model="form.postalCode"
            data-cy="billing-details-input_zipCode"
            name="zipCode"
            label="Zip-code"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          :rules="`required|oneOf:${countries.map(c => c.key).join(',')}`"
          class="form__element">
          <SfSelect
            v-model="form.countryCode"
            data-cy="billing-details-select_country"
            class="form__select sf-select--underlined"
            name="country"
            label="Country"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"
            @input="countryCode => selectCountry(countryCode)">
            <SfSelectOption
              v-for="{ key, label } in countries"
              :key="key"
              :value="key">
              {{ label }}
            </SfSelectOption>
          </SfSelect>
        </ValidationProvider>
      </div>
      <ValidationProvider
        v-slot="{ errors }"
        rules="required|min:8"
        class="form__element">
        <SfInput
          v-model="form.phone"
          data-cy="billing-details-input_phoneNumber"
          name="phone"
          label="Phone number"
          required
          :valid="!errors[0]"
          :error-message="errors[0]"></SfInput>
      </ValidationProvider>
      <SfCheckbox
        v-model="form.isDefault"
        data-cy="billing-details-checkbox_isDefault"
        name="isDefault"
        label="Set as default"
        class="form__checkbox-isDefault"></SfCheckbox>
      <SfButton data-cy="billing-details-btn_update" class="form__button">
        {{ isNew ? "Add the address" : "Update the address" }}
      </SfButton>
    </form>
  </ValidationObserver>
</template>

<script>
import {
  SfInput,
  SfButton,
  SfSelect,
  SfCheckbox
} from '@storefront-ui/vue';
import { reactive } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, min, oneOf } from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'This field is required'
});

extend('min', {
  ...min,
  message: 'The field should have at least {length} characters'
});

extend('oneOf', {
  ...oneOf,
  message: 'Invalid country'
});

export default {
  components: {
    SfInput,
    SfButton,
    SfSelect,
    SfCheckbox,
    ValidationProvider,
    ValidationObserver
  },

  props: {
    countries: {
      type: Array,
      "default":  () => []
    },
    address: {
      type: Object,
      "default":  () => ({})
    },
    isNew: {
      type: Boolean,
      required: true
    }
  },

  setup(props, { emit }) {

    const form = { ...props.address };

    const selectCountry = value => {
      const country = props.countries.find( c => c.key === value);
      if(country) {
        form.countryCode = country.key;
        form.countryName = country.label;
      }
    };
    const submitForm = () => {
      emit('submit', {
        form,
        onComplete: () => { console.log('onComplete') },
        // TODO: Handle Error
        onError: () => { console.log('onError')}
      });
    };

    return {
      form,
      selectCountry,
      submitForm
    };
  }
};
</script>

<style lang='scss' scoped>
@import "~@storefront-ui/vue/styles";
.form {
  &__element {
    display: block;
    margin-bottom: var(--spacer-base);
  }
  &__select {
    display: flex;
    align-items: center;
    --select-option-font-size: var(--font-size--lg);
    ::v-deep .sf-select__dropdown {
      font-size: var(--font-size--lg);
      margin: 0;
      font-family: var(--font-family--secondary);
      font-weight: var(--font-weight--normal);
    }
  }
  &__button {
    display: block;
    margin-top: var(--spacer-lg);
  }
  &__horizontal {
    @include for-desktop {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .form__element {
      @include for-desktop {
        flex: 1;
        margin-right: var(--spacer-lg);
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
