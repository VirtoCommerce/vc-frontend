<template>
  <div>
    <CartSidebar :visible="isCartSidebarOpen"
                 :cart="cart"
                 @click:checkout="openCheckout"
                 @onClose="toggleCartSidebar"></CartSidebar>
    <SfHeader
      :search-value="term"
      :is-sticky="false"
      :is-nav-visible="false"
      :cart-items-qty="String(cart.itemsQuantity)"
      search-placeholder="Search by size, color, part number or keyword"
      :account-icon="accountIcon"
      :logo="'images/logo.svg' | assetUrl"
      title="VC demo store"
      class="sf-header--has-mobile-search"
      @enter:search="changeSearchTerm"
      @change:search="p => term = p">
      <!-- TODO: add mobile view buttons after SFUI team PR -->
      <template #logo>
        <SfLink link="" class="sf-header__logo">
          <SfImage :src="'images/logo.svg' | assetUrl"
                   alt="Vue Storefront Next"
                   class="sf-header__logo-image"></SfImage>
        </SfLink>
      </template>
      <template #header-icons>
        <!-- TODO: Include into SfHeader -->
        <div class="contact">
          <div>1.888.Foo</div>
          <SfLink link="sales@virtocommerce.com"
                  target="_blank"
                  style="outline: none;">
            sales@virtocommerce.com
          </SfLink>
        </div>
        <CpSwitchLang :languages="storeLanguages"
                      :selected="locale"
                      @change="changeLang" />
      </template>
      <template #navigation>
        <SfHeaderNavigationItem
          v-for="menuItem in menuItems"
          :key="menuItem.title"
          class="nav-item"
          :label="menuItem.title"
          :link="menuItem.link">
          <template #desktop-navigation-item>
            <SfLink class="sf-header-navigation-item__link" :link="menuItem.link">
              {{ menuItem.title }}
              <SfIcon class="sf-header-navigation-item__arrow-icon" icon="arrow_down"></SfIcon>
            </SfLink>
          </template>
        </Sfheadernavigationitem>
        <SfHeaderNavigationItem class="nav-item">
          <template #desktop-navigation-item>
            <SfLink class="sf-header-navigation-item__link" link="static-page">
              {{ $t('main_menu.static_page') }}
            </SfLink>
          </template>
        </Sfheadernavigationitem>
      </template>
      <template #navigation_icons>
        <SfHeaderNavigationItem
          class="nav-item"
          label="Part Finder">
          <template #desktop-navigation-item>
            <SfLink class="sf-header-navigation-item__link" link="cell-phones">
              <SfIcon class="sf-header-navigation-item__icon" icon="target"></SfIcon>
              Part Finder
            </SfLink>
          </template>
        </Sfheadernavigationitem>
        <SfHeaderNavigationItem
          class="nav-item"
          label="Account">
          <template #desktop-navigation-item>
            <SfLink class="sf-header-navigation-item__link" @click.prevent="handleAccountClick">
              <SfIcon class="sf-header-navigation-item__icon" icon="account"></SfIcon>
              Account
            </SfLink>
          </template>
        </Sfheadernavigationitem>
        <SfHeaderNavigationItem
          class="nav-item"
          label="Cart">
          <template #desktop-navigation-item>
            <SfLink class="sf-header-navigation-item__link" @click.prevent="toggleCartSidebar">
              <SfIcon class="sf-header-navigation-item__icon"
                      icon="empty_cart"
                      :has-badge="Boolean(cart.itemsQuantity > 0)"
                      :badge-label="String(cart.itemsQuantity)"
                      size="lg"></SfIcon>
            </SfLink>
          </template>
        </Sfheadernavigationitem>
      </template>
    </SfHeader>
  </div>
</template>

<script>
//This line is required
import "@core/services/installCompositionApi";
import { locale , storeLanguages, baseUrl , mainMenu } from '@core/constants';
import { computed, ref, onMounted } from '@vue/composition-api';
import { useUser } from '@libs/account'
import { useCart } from '@libs/cart';
import CartSidebar from '@libs/cart/components/CartSidebar.vue'
import { SfHeader, SfImage, SfLink, CpSwitchLang, SfIcon } from '@libs/storefrontUI/vue';


export default {
  components: {
    SfHeader,
    SfImage,
    SfLink,
    CpSwitchLang,
    SfIcon,
    // LocaleSelector,
    CartSidebar
  },

  setup(props, context) {
    console.log(context);
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
      let url = `/account/login`;
      if (isAuthenticated.value) {
        url=`/account`;
      }
      console.log(url, "handleAccountClick");
      window.location.href = url;
    };

    const openCheckout = () => {
      window.location.href = "/checkout";
    };

    const changeLang = (lang) => {
      window.location.href = `/${lang}/`;
    };

    const menuItems = [{ title: 'Products', link: 'cell-phones'}, { title: 'Material', link: "televisions"}, { title: 'Industries', link: 'cell-phones'}];

    onMounted(async () => {
      await loadMe();
      await loadMyCart();
    });

    return {
      baseUrl,
      accountIcon,
      cart,
      isAuthenticated,
      handleAccountClick,
      toggleCartSidebar,
      changeSearchTerm,
      term,
      openCheckout,
      isCartSidebarOpen,
      mainMenu,
      changeLang,
      menuItems,
      locale,
      storeLanguages
    };
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";

.contact {
    display: flex;
    flex-direction: column;
    margin: 0 0 0 var(--spacer-xl);

    //no var for font-size: 13px;
    font-size: var(--font-size--sm);
    text-align: center;

    a {
      --link-text-decoration: none;
      --link-font-size: 0.812rem;
      --link-font-weight: 400;

      &:hover {
        --link-text-decoration: underline;
      }
    }
}

</style>
