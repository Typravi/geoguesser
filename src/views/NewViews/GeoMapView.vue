<template>
  <div class="GeoMapView">
    <header class="header">
      <h1>GeoMap demo</h1>
      <p>Aktiv region: {{ region }}</p>
    </header>

    <main class="map-area">
      <GeoMap
        v-if="currentMap"
        :scale="scale"
        :map-config="currentMap"
        @map-click="handleMapClick"
      />
    </main>
  </div>
</template>

<script>
import GeoMap from "../../components/GeoMap.vue";
import mapsConfig from "../../assets/maps.json";
//varför import av mapsConfig?

export default {
  name: "GeoMapView",

  components: {
    GeoMap,
  },

  data() {
    return {
      region: "europe",
      scale: 0.35,
    };
  },

  computed: {
    currentMap() {
      return mapsConfig[this.region] || null;
    },
  },

  methods: {
    handleMapClick(pos) {
      //in hit ska vårt mapclick komma från GeoMap sen
    },
  },
};
</script>

<style scoped>
.GeoMapView {
  background-color: #111;
  color: #eee;
  min-height: 100vh;

  display: flex;
  flex-direction: column; /* header överst, karta i mitten, coords nederst */
}

/* Rubrik + current region-text */
.header {
  text-align: center;
  padding: 16px 16px 0;
}

/*I CSS koden nedan centreras kartan*/
.map-area {
  flex: 1; /* tar upp allt ledigt utrymme mellan header och footer */
  display: flex; /* flex-container */
  justify-content: center; /* centrerar horisontellt */
  align-items: center; /* centrerar vertikalt */
  padding: 16px;
}
</style>
