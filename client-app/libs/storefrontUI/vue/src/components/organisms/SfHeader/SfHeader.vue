<template>
  <div class="sf-header" :class="{ 'is-sticky': sticky, 'is-hidden': hidden }">
    <div class="sf-header__wrapper">
      <header ref="header" class="sf-header__header">
        <div class="sf-header__top">
          <!--@slot Use this slot to replace logo with text or image-->
          <slot name="logo" v-bind="{ logo, title }">
            <SfLink link="/">
              <SfImage
                v-if="logo"
                :src="logo"
                :alt="title"
                class="sf-header__logo"></SfImage>
              <h1 v-else class="sf-header__title">
                {{ title }}
              </h1>
            </SfLink>
          </slot>
          <div class="sf-header__aside">
            <!-- @slot Use this slot for language or currency selector -->
            <slot name="aside"></slot>
          </div>
          <div class="sf-header__actions">
            <!--@slot Use this slot to replace default search bar-->
            <slot name="search" v-bind="{ searchValue, searchPlaceholder }">
              <SfSearchBar
                :value="searchValue"
                :icon="searchIcon"
                :placeholder="searchPlaceholder"
                aria-label="Search"
                class="sf-header__search"
                @input="$emit('change:search', $event)"
                @enter="$emit('enter:search', $event)"></SfSearchBar>
            </slot>
            <slot name="header-icons"></slot>
          </div>
        </div>
        <div class="sf-header__bottom">
          <nav
            class="sf-header__navigation"
            :class="{ 'is-visible': isNavVisible }">
            <slot name="navigation"></slot>
          </nav>
          <div class="sf-header__navigation">
            <slot name="navigation_icons"></slot>
          </div>
        </div>
      </header>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { isClient } from "../../../utilities/helpers";
import {
  mapMobileObserver,
  unMapMobileObserver
} from "../../../utilities/mobile-observer";
import SfButton from "../../atoms/SfButton/SfButton.vue";
import SfIcon from "../../atoms/SfIcon/SfIcon.vue";
import SfImage from "../../atoms/SfImage/SfImage.vue";
import SfLink from "../../atoms/SfLink/SfLink.vue";
import SfSearchBar from "../../molecules/SfSearchBar/SfSearchBar.vue";
import SfHeaderNavigation from "./_internal/SfHeaderNavigation.vue";
import SfHeaderNavigationItem from "./_internal/SfHeaderNavigationItem.vue";

Vue.component("SfHeaderNavigation", SfHeaderNavigation);
Vue.component("SfHeaderNavigationItem", SfHeaderNavigationItem);

export default {
  name: "SfHeader",
  components: {
    SfImage,
    SfSearchBar,
    SfLink
  },
  props: {
    /**
     * Header logo
     */
    logo: {
      type: [String, Object],
      "default": ""
    },
    /**
     * Header title
     */
    title: {
      type: String,
      "default": ""
    },

    /**
     * search bar Icon (accepts same value as SfIcon)
     */
    searchIcon: {
      type: [String, Boolean, Array],
      "default": "search"
    },
    /**
     * Header activeIcon (accepts account, wishlist and cart)
     */
    activeIcon: {
      type: String,
      "default": "",
      validator(value) {
        return ["", "account", "wishlist", "cart"].includes(value);
      }
    },
    /**
     * Header search placeholder
     */
    searchPlaceholder: {
      type: String,
      "default": "Search for items"
    },
    /**
     * Header search phrase
     */
    searchValue: {
      type: String,
      "default": ""
    },

    /**
     * Header sticky to top
     */
    isSticky: {
      type: Boolean,
      "default": false
    },
    /**
     * Header search on mobile
     */
    isNavVisible: {
      type: Boolean,
      "default": false
    }
    /**
     * Is nav slot visible at mobile view
     */
  },
  data() {
    return {
      icons: [],
      hidden: false,
      sticky: false,
      scrollDirection: null,
      lastScrollPosition: 0,
      animationStart: null,
      animationLong: null,
      animationDuration: 300
    };
  },
  computed: {
    ...mapMobileObserver(),
    cartHasProducts() {
      return parseInt(this.cartItemsQty, 10) > 0;
    },
    wishlistHasProducts() {
      return parseInt(this.wishlistItemsQty, 10) > 0;
    }
  },
  watch: {
    scrollDirection: {
      handler() {
        if (!isClient) return;
        window.cancelAnimationFrame(this.animationLong);
        this.animationLong = null;
        this.animationStart = null;
        this.animationLong = window.requestAnimationFrame(
          this.animationHandler
        );
      }
    },
    isSticky: {
      handler(isSticky) {
        if (!isClient) return;
        this.sticky = isSticky;
      },
      immediate: true
    }
  },
  mounted() {
    if (this.isSticky) {
      window.addEventListener("scroll", this.scrollHandler, { passive: true });
    }
  },
  beforeDestroy() {
    unMapMobileObserver();
    if (this.isSticky) {
      window.removeEventListener("scroll", this.scrollHandler, {
        passive: true
      });
    }
  },
  methods: {
    animationHandler(timestamp) {
      if (!this.animationStart) this.animationStart = timestamp;
      const progress = timestamp - this.animationStart;
      if (progress < this.animationDuration) {
        this.animationLong = window.requestAnimationFrame(
          this.animationHandler
        );
        return;
      }
      this.hidden = this.scrollDirection === "down";
    },
    scrollHandler() {
      if (!isClient) return;
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (this.refs) {
        if (currentScrollPosition >= this.$refs.header.offsetHeight) {
          this.scrollDirection =
            currentScrollPosition < this.lastScrollPosition ? "up" : "down";
        }
      }
      this.lastScrollPosition = currentScrollPosition;
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/organisms/SfHeader.scss";
</style>
