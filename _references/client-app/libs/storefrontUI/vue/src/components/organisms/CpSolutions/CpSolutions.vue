<template>
  <div class="cp-solutions">
    <div class="cp-solutions__container">
      <slot name="subtitle" v-bind="{ subtitle }">
        <div class="cp-solutions__subtitle" v-text="subtitle" />
      </slot>

      <slot name="title" v-bind="{ title }">
        <div class="cp-solutions__title" v-text="title" />
      </slot>

      <slot name="items" v-bind="{ items }">
        <div class="cp-solutions__items">
          <div v-for="(item, i) in items" :key="i" class="cp-solutions__item">
            <div class="cp-solutions__banner">
              <div
                class="cp-solutions__img"
                :style="{ '--cp-solutions-img-background': 'url(\'' + item.imageUrl + '\')' }"
              />
              <div class="cp-solutions__content">
                <div class="cp-solutions__name" v-text="item.name" />
                <div class="sf-icon cp-solutions__icon">
                  <svg class="sf-icon-path" viewBox="0 0 7 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.954545 14L9.79349e-08 12.8798L5.07793 7L1.12598e-06 1.12024L0.954547 -5.2851e-07L7 7.00006L0.954545 14Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CpSolutions',

  props: {
    /**
     * CpMaterials title.
     */
    title: {
      type: String,
      'default': ''
    },
    /**
     * CpMaterials subtitle.
     */
    subtitle: {
      type: String,
      'default': ''
    },
    /**
     * CpMaterials items.
     */
    items: {
      type: Array,
      'default': []
    }
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/components/organisms/CpSolutions.scss";
</style>
