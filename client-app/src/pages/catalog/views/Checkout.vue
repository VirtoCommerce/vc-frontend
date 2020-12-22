<template>
  <div id="checkout">
    <div class="checkout">
      <div class="checkout__main">
        <SfSteps v-if="currentStep < 4"
                 :active="currentStep"
                 class="checkout__steps">
          <SfStep v-for="(step, index) in STEPS"
                  :key="step.name"
                  :name="step.label">
            <router-view
              @showReview="handleShowReview"
              @changeStep="updateStep($event)"
              @nextStep="handleNextStep(index + 1)"></router-view>
          </SfStep>
        </SfSteps>
        <router-view v-else @changeStep="updateStep($event)"></router-view>
      </div>
      <div v-if="currentStep < 4" class="checkout__aside desktop-only">
        <transition name="fade">
          <CartPreview v-if="showCartPreview" key="order-summary"></CartPreview>
          <OrderReview v-else key="order-review"></OrderReview>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>

import { SfSteps } from '@storefront-ui/vue';
import { ref } from '@vue/composition-api';
import CartPreview from '@libs/checkout/components/CartPreview.vue';
import OrderReview from '@libs/checkout/components/OrderReview.vue';

const STEPS = [
  { name: 'personal-details',
    label: 'Personal Details' },
  { name: 'shipping',
    label: 'Shipping' },
  { name: 'payment',
    label: 'Payment' },
  { name: 'order-review',
    label: 'Review' }
];

export default {
  components: {
    SfSteps,
    CartPreview,
    OrderReview
  },
  setup(props, context) {
    const showCartPreview = ref(true);
    const currentStep = ref(0);

    const handleShowReview = () => {
      showCartPreview.value = false;
    };

    const updateStep = (next) => {
      currentStep.value = next;
    };

    const handleNextStep = (nextStep) => {
      context.root.$router.push(nextStep < 4 ? STEPS[nextStep].name : 'thank-you');
    };

    return {
      STEPS,
      handleNextStep,
      currentStep,
      updateStep,
      handleShowReview,
      showCartPreview
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#checkout {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1240px;
    margin: 0 auto;
  }
}
.checkout {
  @include for-desktop {
    display: flex;
  }
  &__main {
    @include for-desktop {
      flex: 1;
      padding: var(--spacer-xl) 0 0 0;
    }
  }
  &__aside {
    @include for-desktop {
      flex: 0 0 25.5rem;
      margin: 0 0 0 4.25rem;
    }
  }
  &__steps {
    --steps-content-padding: 0 var(--spacer-base);
    @include for-desktop {
      --steps-content-padding: 0;
    }
  }
}
</style>
