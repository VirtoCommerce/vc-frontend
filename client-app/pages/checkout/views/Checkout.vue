<template>
  <div id="checkout">
    <div class="checkout">
      <div class="checkout__main">
        <SfSteps v-if="!isThankYou"
                 :active="currentStepIndex"
                 :class="{ 'checkout__steps': true, 'checkout__steps-auth': isAuthenticated }"
                 @change="handleStepClick">
          <SfStep v-for="(step, key) in STEPS"
                  :key="key"
                  :name="step">
            <router-view></router-view>
          </SfStep>
        </SfSteps>
        <router-view v-else></router-view>
      </div>
      <div v-if="!isThankYou" class="checkout__aside desktop-only">
        <transition name="fade">
          <CartPreview v-if="showCartPreview" key="order-summary"></CartPreview>
          <OrderReview v-else key="order-review"></OrderReview>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>

import { ref, computed, onMounted, provide } from '@vue/composition-api';
import { useCart } from '@libs/cart';
import { SfSteps } from '@libs/storefrontUI/vue';
import CartPreview from './CartPreview.vue';
import OrderReview from './OrderReview.vue';

const STEPS = {
  'personal-details': 'Personal Details',
  shipping: 'Shipping',
  payment: 'Payment',
  'order-review': 'Review'
};

export default {
  components: {
    SfSteps,
    CartPreview,
    OrderReview
  },
  setup(props, context) {
    const currentStep = computed(() => context.root.$route.path.split('/').pop());
    const isAuthenticated  = ref(false);
    const showCartPreview = ref(true);
    const currentStepIndex = computed(() => Object.keys(STEPS).findIndex(s => s === currentStep.value));
    const isThankYou = computed(() => currentStep.value === 'thank-you');
    const { cart, loadMyCart } = useCart();

    const handleStepClick = (stepIndex) => {
      const key = Object.keys(STEPS)[stepIndex];
      context.root.$router.push(`/${key}`);
    };

    onMounted(async () => {
      if(!cart?.value){
        await loadMyCart();
      }
    })

    return {
      cart,
      handleStepClick,
      STEPS,
      currentStepIndex,
      isThankYou,
      currentStep,
      showCartPreview,
      isAuthenticated
    };
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";
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
