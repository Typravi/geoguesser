<template>
  <div class="geo-view">
    <header class="header">
      <h1>GeoMap demo</h1>
      <p>Aktiv region: {{ region }}</p>
    </header>

    <div class="mapConatiner">
      <div class="box1">HEJ1</div>
      <div class="box2">HEJ2</div>
      <div class="box3">HEJ3</div>
    </div>

    <main class="map-area">
      <GeoMap
        v-if="currentMap"
        :scale="scale"
        :map-config="currentMap"
        @map-click="handleMapClick"
      />
    </main>

    <footer v-if="lastClick" class="coords">
      <p>
        Senaste klick (originalpixlar): x: {{ lastClick.x.toFixed(0) }}, y:
        {{ lastClick.y.toFixed(0) }}
      </p>
    </footer>
  </div>
</template>

<script>
import GeoMap from "../../components/GeoMap.vue";
import mapsConfig from "../../assets/maps.json";

export default {
  name: "GeoMapView",

  components: {
    GeoMap,
  },

  data() {
    return {
      region: "europe",
      scale: 0.35,
      lastClick: null,
    };
  },

  computed: {
    currentMap() {
      return mapsConfig[this.region] || null;
    },
  },

  methods: {
    handleMapClick(pos) {
      this.lastClick = pos;
    },
  },
};
</script>

<style scoped>
.geo-view {
  background-color: #111;
  color: #eee;
  min-height: 100vh;

  display: flex;
  flex-direction: column; /* header överst, karta i mitten, coords nederst */
}

/* Rubrik + aktiv region-text */
.header {
  text-align: center;
  padding: 16px 16px 0;
}

/* Här sker magin: kartan centreras i det flex:1-området */
.map-area {
  flex: 1; /* tar upp allt ledigt utrymme mellan header och footer */
  display: flex; /* flex-container */
  justify-content: center; /* centrera horisontellt */
  align-items: center; /* centrera vertikalt */
  padding: 16px;
}

/* Koordinater längst ner */
.coords {
  text-align: center;
  padding: 0 16px 16px;
}

/*från template:
    <div class="mapConatiner">
      <div class="box1">HEJ</div>
      <div class="box2">HEJ</div>
      <div class="box3">HEJ</div>
    </div>
*/
.mapConatiner {
  display: flex;
  flex-direction: row; /*detta är default*/
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.box3 {
  font-size: larger;
}
</style>
