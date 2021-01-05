<template>
  <div id="my-account">
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"></SfBreadcrumbs>
    <SfContentPages
      data-cy="my-account_content-pages"
      title="My Account"
      :active="activePage"
      class="my-account"
      @click:change="changeActivePage">
      <SfContentCategory title="Personal Details">
        <SfContentPage data-cy="my-account-page_my-profile" title="My profile">
          <MyProfile></MyProfile>
        </SfContentPage>

        <SfContentPage data-cy="my-account-page_shipping-details" title="Shipping details">
          <ShippingDetails></ShippingDetails>
        </SfContentPage>

        <SfContentPage data-cy="my-account-page_billing-details" title="Billing details">
          <BillingDetails></BillingDetails>
        </SfContentPage>

        <SfContentPage data-cy="my-account-page_order-history" title="Order history">
          <OrderHistory></OrderHistory>
        </SfContentPage>

        <SfContentPage data-cy="my-account-page_log-out" title="Log out"></SfContentPage>
      </SfContentcategory>
    </SfContentPages>
  </div>
</template>
<script>
import { SfBreadcrumbs, SfContentPages } from '@storefront-ui/vue';
import { computed, ref, watch } from '@vue/composition-api';
import BillingDetails from './MyAccount/BillingDetails.vue';
import MyProfile from './MyAccount/MyProfile.vue';
import OrderHistory from './MyAccount/OrderHistory.vue';
import ShippingDetails from './MyAccount/ShippingDetails.vue';

export default {
  components: {
    SfBreadcrumbs,
    SfContentPages,
    MyProfile,
    ShippingDetails,
    BillingDetails,
    OrderHistory
  },
  setup(props, context) {

    const { $router } = context.root;

    const logout = () => { console.log('logout'); }

    const activePage = computed(() => {
      const { pageName } = context.root.$route.params;
      if (pageName) {
        return (pageName.charAt(0).toUpperCase() + pageName.slice(1)).replace('-', ' ');
      }
      return 'My profile';
    });

    const changeActivePage = async (title) => {
      if (title === 'Log out') {
        await logout();
        $router.push('/');
        return;
      }

      $router.push(`/my-account/${(title || '').toLowerCase().replace(' ', '-')}`);
    };

    return { changeActivePage, activePage };
  },

  data() {
    return {
      breadcrumbs: [
        {
          text: 'Home',
          route: { link: '#' }
        },
        {
          text: 'My Account',
          route: { link: '#' }
        }
      ]
    };
  }
};
</script>

<style lang='scss' scoped>
@import "~@storefront-ui/vue/styles";

body {
  padding: 0;
  margin: 0;
}

#layout {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1240px;
    margin: auto;
  }
}


#my-account {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1240px;
    margin: 0 auto;
  }
}
.my-account {
  @include for-mobile {
    --content-pages-sidebar-category-title-font-weight: var(
      --font-weight--normal
    );
    --content-pages-sidebar-category-title-margin: var(--spacer-sm)
      var(--spacer-sm) var(--spacer-sm) var(--spacer-base);
  }
  @include for-desktop {
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) 0 0 0;
  }
}
.breadcrumbs {
  margin: var(--spacer-base) 0 var(--spacer-lg);
}
</style>
