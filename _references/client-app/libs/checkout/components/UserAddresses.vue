<template>
  <div>
    <SfAddressPicker
      :selected="String(currentAddressId)"
      class="user-addresses"
      @change="$emit('setCurrentAddress', $event)">
      <SfAddress
        v-for="userAddress in userAddresses"
        :key="userAddress.id"
        class="user-addresses__address"
        :name="String(userAddress.id)">
        <UserAddress :address="userAddress"></UserAddress>
      </SfAddress>
    </SfAddressPicker>
    <SfCheckbox
      :selected="setAsDefault"
      name="setAsDefault"
      label="Use this address as my default one."
      class="user-address-setAsDefault"
      @change="$emit('changeSetAsDefault', $event)"></SfCheckbox>
  </div>
</template>

<script>
import { UserAddress } from '@libs/misc';
import {
  SfCheckbox,
  SfAddressPicker
} from '@libs/storefrontUI/vue';


export default {
  components: {
    SfCheckbox,
    SfAddressPicker,
    UserAddress
  },

  props: {
    currentAddressId: {
      type: String,
      required: true
    },
    setAsDefault: {
      type: Boolean,
      required: true
    },
    userAddresses: {
      type: Array,
      required: true
    }
  },
  setup (_, { emit }) {
    return {

    };
  }
};
</script>

<style lang="scss">
@import "assets/styles/scss/all.scss";

.user-addresses {
  @include for-desktop {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 10px;
  }
  margin-bottom: var(--spacer-xl);
  &__address {
    margin-bottom: var(--spacer-sm);
  }
}

.user-address-setAsDefault, .form__action-button--margin-bottom {
  margin-bottom: var(--spacer-xl);
}
</style>
