<template>
  <ValidationObserver v-slot="{ handleSubmit, reset }">
    <form class="form" @submit.prevent="handleSubmit(submitForm(reset))">
      <div class="form__horizontal">
        <ValidationProvider v-slot="{ errors }"
                            rules="required|min:2"
                            class="form__element">
          <SfInput
            v-model="form.contact.firstName"
            data-cy="my-profile-input_firstName"
            name="firstName"
            label="First Name"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            rules="required|min:2"
                            class="form__element">
          <SfInput
            v-model="form.contact.lastName"
            data-cy="my-profile-input_lastName"
            name="lastName"
            label="Last Name"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
      </div>
      <ValidationProvider v-slot="{ errors }"
                          rules="required|email"
                          class="form__element">
        <SfInput
          v-model="form.email"
          data-cy="my-profile-input_email"
          type="email"
          name="email"
          label="Your e-mail"
          required
          :valid="!errors[0]"
          :error-message="errors[0]"></SfInput>
      </ValidationProvider>
      <SfButton data-cy="my-profile-btn_update" class="form__button">
        Update personal data
      </SfButton>
    </form>
    <div>
      <SfAlert v-for="{ code, description } in errors"
               :key="code"
               :message="description"
               :type="'danger'"></SfAlert>
    </div>
  </ValidationObserver>
</template>

<script>
import { ref, toRef, computed, watch } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { SfInput, SfButton, SfAlert } from '@libs/storefrontUI/vue';

export default {
  components: {
    SfInput,
    SfButton,
    SfAlert,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    user: {
      type: Object,
      "default":  () => ({})
    }
  },
  setup(props, { emit }) {
    const userRef = toRef(props, 'user');
    const form = ref({ ...userRef.value, contact: { ...userRef.value?.contact } });
    const errors = ref([]);
    //This is required to keep the reactive state immutable. Sue to two way binding the user state can be modified without this code.
    watch(userRef, () => form.value = { ...userRef.value, contact: { ...userRef.value?.contact } } );

    const submitForm = () => {
      emit('submit', {
        form,
        onComplete: () => { console.log('onComplete') },
        onError: (data) => {
          errors.value = data;
        }
      });
    };
    return {
      form,
      errors,
      submitForm
    };
  }
};
</script>

<style lang='scss' scoped>
@import "assets/styles/scss/all.scss";

.form {
  &__element {
    display: block;
    margin: 0 0 var(--spacer-lg) 0;
  }
  &__button {
    display: block;
    width: 100%;
    @include for-desktop {
      width: 17.5rem;
    }
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
        margin-right: var(--spacer-2xl);
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
