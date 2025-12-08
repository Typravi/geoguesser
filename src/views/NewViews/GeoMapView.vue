<template>
  <div class="geo-view">
    <h1>GeoMap demo</h1>

    <div class="buttons">
      <button @click="region = 'europe'">Europa</button>
      <button @click="region = 'asia'">Asien</button>
    </div>

    <p>Aktiv region: {{ region }}</p>

    <GeoMap
      v-if="currentMap"
      :scale="scale"
      :map-config="currentMap"
      @map-click="handleMapClick"
    />

    <div v-if="lastClick" class="coords">
      <p>Senaste klick (originalpixlar): x: {{ lastClick.x.toFixed(0) }}, y: {{ lastClick.y.toFixed(0) }}</p>
    </div>
  </div>
</template>

<script>
import GeoMap from '../../components/GeoMap.vue';
import mapsConfig from '../../assets/maps.json';

export default {
  name: "GeoMapView",

  components: {
    GeoMap
  },

  data() {
    return {
      region: "europe",   // byt mellan "europe" / "asia"
      scale: 0.35,
      lastClick: null
    };
  },

  computed: {
    currentMap() {
      return mapsConfig[this.region] || null;
    }
  },

  methods: {
    handleMapClick(pos) {
      // just nu: bara logga / visa koordinaterna
      console.log("Klick på karta:", pos);
      this.lastClick = pos;
    }
  }
};
</script>

<style scoped>
.geo-view {
  background-color: #111;
  color: #eee;
  min-height: 100vh;
  padding: 16px;
}

.buttons button {
  margin-right: 8px;
}

.coords {
  margin-top: 16px;
}
</style>