<template>
  <div class="h-screen w-screen">
    <GoogleMap api-key="AIzaSyAAt1IUts-x_5Veq-HxUElzZOtYuBzzG5Q" :center="{ lat: 40.7128, lng: -74.006 }" :zoom="15">
      <template #default="{ map, markerLibrary, error }">
        <GoogleMapMarker
          v-if="map && markerLibrary && !error"
          :map="map"
          :marker-library="markerLibrary"
          :position="{ lat: 40.7128, lng: -74.006 }"
          title="New York City"
        />
      </template>
    </GoogleMap>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/core/composables";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

const { t } = useI18n();

const page404Anchor = shallowRef<HTMLElement | null>(null);
const page404AnchorIsVisible = useElementVisibility(page404Anchor);

const head = useHead({});
const { title } = usePageTitle(`${t("pages.404.error_code")} ${t("pages.404.error_text")}`);

watch(page404AnchorIsVisible, (value) => {
  if (value && head) {
    head.patch({
      title: title.value,
    });
  }
});
</script>

<style scoped lang="scss">
.vc-typography--variant--h1 {
  @apply normal-case;
}
</style>
