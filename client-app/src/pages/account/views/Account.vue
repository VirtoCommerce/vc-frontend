<template>
  <div id="my-account">
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"
    />
    <SfContentPages
      title="My Account"
      :active="activePage"
      class="my-account"
      @click:change="changeActivePage"
    >
      <SfContentCategory title="Personal Details">
        <SfContentPage title="My profile">
          <Profile
            :account="account"
            @update:personal="account = { ...account, ...$event }"
            @update:password="account = { ...account, ...$event }"
          />
        </SfContentPage>
        <SfContentPage title="Shipping details">
          <ShippingDetails
            :account="account"
            @update:shipping="account = { ...account, ...$event }"
          />
        </SfContentPage>
        <SfContentPage title="Newsletter">
          <Newsletter />
        </SfContentPage>
      </SfContentCategory>
      <SfContentCategory title="Order details">
        <SfContentPage title="Order history">
          <OrderHistory :account="account" />
        </SfContentPage>
      </SfContentCategory>
      <SfContentPage title="Log out" />
    </SfContentPages>
  </div>
</template>
<script>
import { SfBreadcrumbs, SfContentPages } from "@storefront-ui/vue";
import { Profile, ShippingDetails, Newsletter, OrderHistory} from "./_internal/index.js";
import { computed } from '@vue/composition-api';

export default {
  name: "MyAccount",
  components: {
    SfBreadcrumbs,
    SfContentPages,
    Profile,
    ShippingDetails,
    Newsletter,
    OrderHistory,
  },
  setup(props, context)  {
    const activePage = "My profile";
    const account = {
      firstName: "John",
      lastName: "Cena",
      email: "johndog@email.com",
      password: "a*23Et",
      shipping: [{
        firstName: "John",
        lastName: "Cena",
        streetName: "Sezame Street",
        apartment: "24/193A",
        city: "Wroclaw",
        state: "Lower Silesia",
        zipCode: "53-540",
        country: "USA",
        phoneNumber: "(00)560 123 456",
      }, {
        firstName: "John",
        lastName: "Cena",
        streetName: "Sezame Street",
        apartment: "20/193A",
        city: "Wroclaw",
        state: "Lower Silesia",
        zipCode: "53-603",
        country: "USA",
        phoneNumber: "(00)560 123 456",
      }],
      orders: [
        ["#35765", "4th Nov, 2019", "Visa card", "$12.00", "In process"],
        ["#35766", "4th Nov, 2019", "Paypal", "$12.00", "Finalised"],
        ["#35768", "4th Nov, 2019", "Mastercard", "$12.00", "Finalised"],
        ["#35769", "4th Nov, 2019", "Paypal", "$12.00", "Finalised"],
      ]
    };

    // Computed
    const breadcrumbs = computed(() => [{
      text: "Home",
      route: { link: "#" }
    }, {
      text: "My Account",
      route: { link: "#" }
    }]);

    // Events
    // Active page changed
    const changeActivePage = (title) => {
      if (title === "Log out") {
        alert("You are logged out!");
        return;
      }
      this.activePage = title;
    }

    return {
      breadcrumbs,
      account,
      changeActivePage
    };
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#my-account {
  box-sizing: border-box;
  @include for-desktop {
    max-width: 1272px;
    padding: 0 var(--spacer-sm);
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
  padding: var(--spacer-base) 0 var(--spacer-lg);
}
</style>
