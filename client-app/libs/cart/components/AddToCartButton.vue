<template>
  <SfCircleIcon
    class="sf-product-card__add-button"
    :aria-label="`Add to Cart ${title}`"
    :has-badge="false"
    :disabled="!buyable"
    @click="onAddToCart">
    <div class="sf-product-card__add-button--icons">
      <transition name="sf-pulse" mode="out-in">
        <slot
          v-if="!isAddingToCart"
          name="add-to-cart-icon">
          <SfIcon
            key="add_to_cart"
            icon="add_to_cart"
            size="20px"
            color="white"></SfIcon>
        </slot>
        <slot v-else name="adding-to-cart-icon">
          <SfIcon
            key="added_to_cart"
            icon="added_to_cart"
            size="20px"
            color="white"></SfIcon>
        </slot>
      </transition>
    </div>
  </SfCircleIcon>
</template>

<script>

import { computed, onMounted, ref } from '@vue/composition-api';
import { useCart } from '@libs/cart';
import { SfCircleIcon, SfIcon } from '@libs/storefrontUI/vue';

export default {

  components: {
    SfCircleIcon,
    SfIcon
  },
  props: {
    productId: {
      type: String,
      "default": ''
    },
    title: {
      type: String,
      "default": ''
    },
    buyable: {
      type: Boolean,
      "default": false
    }
  },
  setup(props, context) {
    // States
    const { loadMyCart, addToCart } = useCart();
    // Refs
    const addingToCart = ref(false);
    // Computed
    const isAddingToCart = computed(() => addingToCart.value);
    // Init
    onMounted(async () => {
      await loadMyCart();
    });
    // Events
    const onAddToCart = async () => {
      addingToCart.value = true;
      await addToCart(props.productId, 1);
      addingToCart.value = false;
    };

    return {
      addingToCart,
      isAddingToCart,
      onAddToCart
    };
  }
};

</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";
</style>
