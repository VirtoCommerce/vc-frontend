<template>
  <div>
    <CartSidebar :visible="isCartSidebarOpen"
                 :cart="cart"
                 @click:checkout="openCheckout"
                 @onClose="toggleCartSidebar"></CartSidebar>
    <SfHeader
      data-cy="app-header"
      :search-value="term"
      :cart-items-qty="cart.itemsQuantity"
      :account-icon="accountIcon"
      class="sf-header--has-mobile-search"
      @click:cart="toggleCartSidebar"
      @click:account="handleAccountClick"
      @enter:search="changeSearchTerm"
      @change:search="p => term = p">
      <!-- TODO: add mobile view buttons after SFUI team PR -->
      <template #logo>
        <SfLink href="/">
          <SfImage :src="'images/logo.svg' | assetUrl"
                   alt="Vue Storefront Next"
                   class="sf-header__logo-image"></SfImage>
        </SfLink>
      </template>
      <template #navigation>
        <SfHeaderNavigationItem v-for="{ url, title } in mainMenu"
                                :key="url"
                                class="nav-item"
                                data-cy="app-header-url_women"
                                :label="title"
                                :link="url"></SfHeaderNavigationItem>
      </template>
      <template #aside>
        <LocaleSelector class="smartphone-only"></LocaleSelector>
      </template>
    </SfHeader>
  </div>
</template>

<script>
//This line is required
import "@core/services/installCompositionApi";
import { SfHeader, SfImage, SfLink } from '@storefront-ui/vue';
import { computed, ref, onMounted } from '@vue/composition-api';
import { useUser } from '@libs/account'
import { useCart } from '@libs/cart';
import CartSidebar from '@libs/cart/components/CartSidebar.vue'
import { baseUrl, mainMenu } from '@core/constants';
import LocaleSelector from '../components/LocaleSelector.vue';

export default {
  components: {
    SfHeader,
    SfImage,
    SfLink,
    LocaleSelector,
    CartSidebar
  },
  setup(props, context) {
    const { isCartSidebarOpen, toggleCartSidebar } = useCart();

    const { isAuthenticated, loadMe } = useUser();
    const { cart, loadMyCart } = useCart();

    const term = ref('');

    const changeSearchTerm = () =>
    {
      console.log("changeSearchTerm", term.value);
    };
    const accountIcon = computed(() => isAuthenticated.value ? 'profile_fill' : 'profile');


    const handleAccountClick = async () => {
      let url = `${baseUrl}/account/login`;
      if (isAuthenticated.value) {
        url=`${baseUrl}/account`;
      }
      window.location.href = url;
    };

    const openCheckout = () => {
      window.location.href = "/checkout";
    };

    onMounted(async () => {
      await loadMe();
      await loadMyCart();
    });

    return {
      accountIcon,
      cart,
      isAuthenticated,
      handleAccountClick,
      toggleCartSidebar,
      changeSearchTerm,
      term,
      openCheckout,
      isCartSidebarOpen,
      mainMenu
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
.sf-header {
  --header-padding:  var(--spacer-sm);
  @include for-desktop {
    --header-padding: 0;
  }
  &__logo-image {
      height: 100%;
  }
}

.nav-item {
  --header-navigation-item-margin: 0 var(--spacer-base);
}
</style>
