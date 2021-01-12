<template>
  <SfFooter id="footer"
            :column="4"
            multiple>
    <SfFooterColumn :title="$t('About us')">
      <SfList>
        <SfListItem
          v-for="item in aboutUs"
          :key="item">
          <SfMenuItem
            :data-cy="`app-foter-url_about-us_${item.split(' ').join('-').toLowerCase()}`"
            :label="$t(item)"></SfMenuItem>
        </SfListItem>
      </SfList>
    </SfFooterColumn>
    <SfFooterColumn :title="$t('Departments')">
      <SfList>
        <SfListItem
          v-for="item in departments"
          :key="item">
          <SfMenuItem
            :data-cy="`app-foter-url_departments_${item.split(' ').join('-').toLowerCase()}`"
            :label="$t(item)"></SfMenuItem>
        </SfListItem>
      </SfList>
    </SfFooterColumn>
    <SfFooterColumn :title="$t('Help')">
      <SfList>
        <SfListItem
          v-for="item in help"
          :key="item">
          <SfMenuItem
            :data-cy="`app-foter-url_help_${item.split(' ').join('-').toLowerCase()}`"
            :label="$t(item)"></SfMenuItem>
        </SfListItem>
      </SfList>
    </SfFooterColumn>
    <SfFooterColumn :title="$t('Payment & Delivery')">
      <SfList>
        <SfListItem
          v-for="item in paymentsDelivery"
          :key="item">
          <SfMenuItem
            :data-cy="`app-foter-url_payment_${item.split(' ').join('-').toLowerCase()}`"
            :label="$t(item)"></SfMenuItem>
        </SfListItem>
      </SfList>
    </SfFooterColumn>
  </SfFooter>
</template>

<script>
import { SfFooter, SfList, SfImage, SfMenuItem } from '@storefront-ui/vue';

export default {
  components: {
    SfFooter,
    SfList,
    SfImage,
    SfMenuItem
  },
  data() {
    return {
      aboutUs: ['Who we are', 'Quality in the details', 'Customer Reviews'],
      departments: ['Women fashion', 'Men fashion', 'Kidswear', 'Home'],
      help: ['Customer service', 'Size guide', 'Contact us'],
      paymentsDelivery: ['Purchase terms', 'Guarantee'],
      social: ['facebook', 'pinterest', 'twitter', 'youtube'],
      isMobile: false,
      desktopMin: 1024
    };
  }
};
</script>

<style lang="scss">
@import "~@storefront-ui/vue/styles";
.sf-footer {
  &__container {
    --footer-margin: var(--spacer-sm);
    @include for-desktop {
      --footer-margin: var(--spacer-3xl) auto var(--spacer-xl);
      --footer-padding: 0;
    }
  }
}
.footer {
  &__socials {
    display: flex;
    justify-content: space-between;
    margin: 0 0 var(--spacer-lg) 0;
    padding: var(--spacer-base) var(--spacer-xl);
    @include for-desktop {
      justify-content: flex-start;
      padding: var(--spacer-base) 0;
    }
  }
  &__social-image {
    margin: 0 var(--spacer-lg) 0 0;
  }
}
</style>
