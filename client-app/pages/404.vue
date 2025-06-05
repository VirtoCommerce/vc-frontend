<template>
  <div class="mt-5 h-screen w-screen">
    <GoogleMap api-key="AIzaSyAAt1IUts-x_5Veq-HxUElzZOtYuBzzG5Q" :center="{ lat: 40.7589, lng: -73.9851 }" :zoom="12">
      <GoogleMapInfoMarkerClusterer>
        <GoogleMapMarker
          v-for="location in nycLocations"
          :key="location.title"
          :position="location.position"
          :title="location.title"
          :content="location.title"
        >
        </GoogleMapMarker>
      </GoogleMapInfoMarkerClusterer>
    </GoogleMap>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/core/composables";
import GoogleMapInfoMarkerClusterer from "@/shared/common/components/google-maps/google-map-info-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

const { t } = useI18n();

const nycLocations = [
  { position: { lat: 40.7484, lng: -73.9857 }, title: "Empire State Building" },
  { position: { lat: 40.7589, lng: -73.9851 }, title: "Times Square" },
  { position: { lat: 40.7505, lng: -73.9934 }, title: "Madison Square Garden" },
  { position: { lat: 40.7614, lng: -73.9776 }, title: "Central Park" },
  { position: { lat: 40.7549, lng: -73.984 }, title: "Rockefeller Center" },
  { position: { lat: 40.7829, lng: -73.9654 }, title: "Metropolitan Museum of Art" },
  { position: { lat: 40.7282, lng: -74.0776 }, title: "One World Trade Center" },
  { position: { lat: 40.7092, lng: -74.0134 }, title: "Brooklyn Bridge" },
  { position: { lat: 40.7527, lng: -73.9772 }, title: "Chrysler Building" },
  { position: { lat: 40.758, lng: -73.9855 }, title: "Broadway Theater District" },
  { position: { lat: 40.742, lng: -74.004 }, title: "High Line Park" },
  { position: { lat: 40.741, lng: -73.9896 }, title: "Flatiron Building" },
  { position: { lat: 40.7308, lng: -73.9973 }, title: "Washington Square Park" },
  { position: { lat: 40.704, lng: -74.0137 }, title: "Stone Street Historic District" },
  { position: { lat: 40.7891, lng: -73.9598 }, title: "Guggenheim Museum" },
  { position: { lat: 40.7794, lng: -73.9632 }, title: "American Museum of Natural History" },
  { position: { lat: 40.718, lng: -74.002 }, title: "Tribeca" },
  { position: { lat: 40.726, lng: -73.9897 }, title: "SoHo Shopping District" },
  { position: { lat: 40.7359, lng: -74.0014 }, title: "Chelsea Market" },
  { position: { lat: 40.7831, lng: -73.9712 }, title: "Lincoln Center" },
];

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
