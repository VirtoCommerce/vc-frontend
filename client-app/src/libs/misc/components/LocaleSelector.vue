<template>
  <div class="container">
    <SfButton
      data-cy="locale-select_change-langauge"
      class="container__lang container__lang--selected"
      @click="isLangModalOpen = !isLangModalOpen">
      <SfImage :src="`/icons/langs/${locale}.webp`" width="20"></SfImage>
    </SfButton>
    <SfBottomModal :is-open="isLangModalOpen"
                   title="Choose language"
                   @click:close="isLangModalOpen = !isLangModalOpen">
      <SfList>
        <SfListItem v-for="lang in availableLocales" :key="lang">
          <a :href="'/'+lang">
            <SfCharacteristic class="language">
              <template #title>
                <span>{{ lang }}</span>
              </template>
              <template #icon>
                <SfImage :src="`/icons/langs/${lang}.webp`"></SfImage>
              </template>
            </SfCharacteristic>
          </a>
        </SfListItem>
      </SfList>
    </SfBottomModal>
  </div>
</template>

<script>
import {
  SfImage,
  SfSelect,
  SfButton,
  SfList,
  SfBottomModal,
  SfCharacteristic
} from '@storefront-ui/vue';
import { ref, computed } from '@vue/composition-api';
import { locales, locale } from '@core/constants';
export default {
  components: {
    SfImage,

    SfButton,
    SfList,
    SfBottomModal,
    SfCharacteristic
  },
  setup(props, context) {

    const isLangModalOpen = ref(false);
    const availableLocales = computed(() => locales.filter(i => i !== locale));

    return {
      availableLocales,
      locale,
      isLangModalOpen
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";

.container {
  margin: 0 -5px;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  position: relative;

  .sf-bottom-modal {
    z-index: 2;
    left: 0;
    @include for-desktop {
      --bottom-modal-height: 100vh;
    }
  }

  .sf-list {
    .language {
      padding: var(--spacer-sm) 0;
    }

    @include for-desktop {
      display: flex;
    }

    .sf-image {
      --image-width: 20px;
      margin-right: 1rem;
      border: 1px solid var(--c-light);
      border-radius: 50%;
    }
  }

  &__lang {
    --image-width: 20px;
    --button-box-shadow: none;
    background: none;
    padding: 0 5px;
    display: flex;
    align-items: center;
    opacity: 0.5;
    border: none;
    &:hover,
    &--selected {
      opacity: 1;
    }
  }
}
</style>
