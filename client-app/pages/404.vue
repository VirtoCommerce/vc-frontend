<template>
  <div class="mt-5 h-screen w-screen overflow-auto">
    <div class="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-2">
      <!-- NYC Map -->
      <div class="flex flex-col">
        <h2 class="mb-4 text-center text-2xl font-bold" @click="map1visible = !map1visible">
          New York City {{ refCount1 }} / {{ markers1.length }}
        </h2>
        <GoogleMap
          v-if="map1visible"
          api-key="AIzaSyAAt1IUts-x_5Veq-HxUElzZOtYuBzzG5Q"
          :center="{ lat: 40.7589, lng: -73.9851 }"
          :zoom="11"
          element-id="nyc-map"
          map-id="nyc-map"
        >
          <GoogleMapInfoMarkerClusterer map-id="nyc-map">
            <GoogleMapMarker
              v-for="location in nycLocations"
              :key="location.title"
              :position="location.position"
              :title="location.title"
              :info-content="location.title"
              map-id="nyc-map"
            />
          </GoogleMapInfoMarkerClusterer>
        </GoogleMap>
      </div>

      <!-- LA Map -->
      <div class="flex flex-col">
        <h2 class="mb-4 text-center text-2xl font-bold" @click="map2visible = !map2visible">
          Los Angeles {{ refCount2 }} / {{ markers2.length }}
        </h2>
        <GoogleMap
          v-if="map2visible"
          api-key="AIzaSyAAt1IUts-x_5Veq-HxUElzZOtYuBzzG5Q"
          :center="{ lat: 34.0522, lng: -118.2437 }"
          :zoom="10"
          element-id="la-map"
          map-id="la-map"
        >
          <GoogleMapInfoMarkerClusterer map-id="la-map">
            <GoogleMapMarker
              v-for="location in laLocations"
              :key="location.title"
              :position="location.position"
              :title="location.title"
              :info-content="location.title"
              map-id="la-map"
            />
          </GoogleMapInfoMarkerClusterer>
        </GoogleMap>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageTitle } from "@/core/composables";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
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

const laLocations = [
  { position: { lat: 34.1341, lng: -118.3215 }, title: "Hollywood Sign" },
  { position: { lat: 34.1016, lng: -118.3406 }, title: "Hollywood Walk of Fame" },
  { position: { lat: 34.0522, lng: -118.2437 }, title: "Downtown LA" },
  { position: { lat: 34.0928, lng: -118.4081 }, title: "Beverly Hills" },
  { position: { lat: 34.0195, lng: -118.4912 }, title: "Santa Monica Pier" },
  { position: { lat: 34.0259, lng: -118.7798 }, title: "Malibu Beach" },
  { position: { lat: 34.1184, lng: -118.3004 }, title: "Griffith Observatory" },
  { position: { lat: 34.0972, lng: -118.3473 }, title: "TCL Chinese Theatre" },
  { position: { lat: 34.0522, lng: -118.243 }, title: "Walt Disney Concert Hall" },
  { position: { lat: 34.0736, lng: -118.4004 }, title: "Rodeo Drive" },
  { position: { lat: 34.0118, lng: -118.4951 }, title: "Venice Beach" },
  { position: { lat: 34.1184, lng: -118.3004 }, title: "Griffith Park" },
  { position: { lat: 34.0407, lng: -118.2468 }, title: "LA Convention Center" },
  { position: { lat: 34.0169, lng: -118.499 }, title: "Santa Monica Beach" },
  { position: { lat: 34.0928, lng: -118.4081 }, title: "Sunset Strip" },
  { position: { lat: 34.143, lng: -118.2537 }, title: "Universal Studios Hollywood" },
  { position: { lat: 34.0134, lng: -118.4948 }, title: "Third Street Promenade" },
  { position: { lat: 34.0754, lng: -118.2644 }, title: "Los Angeles Zoo" },
  { position: { lat: 34.0522, lng: -118.2571 }, title: "Museum of Contemporary Art" },
  { position: { lat: 34.0639, lng: -118.3581 }, title: "The Grove Shopping Center" },
];

const page404Anchor = shallowRef<HTMLElement | null>(null);
const page404AnchorIsVisible = useElementVisibility(page404Anchor);

const head = useHead({});
const { title } = usePageTitle(`${t("pages.404.error_code")} ${t("pages.404.error_text")}`);

const map1visible = ref(true);
const map2visible = ref(true);

const { refCount: refCount1, markers: markers1 } = useGoogleMaps("nyc-map");
const { refCount: refCount2, markers: markers2 } = useGoogleMaps("la-map");

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
