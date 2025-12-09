<template>
  <div class="GeoMapView">
    <header class="header">
      <h1>GeoMap (under utveckling hehe)</h1>
      <p>Spelad region: {{ region }}</p>
      <h2>Klicka på: {{ cityToFind }}</h2>
    </header>

    <main class="map-area">
      <GeoMap
        v-if="currentMap"
        :scale="scale"
        :map-config="currentMap"
        :correct-location="correctLocation"
        @map-click="handleMapClick"
      />
    </main>
    <footer v-if="lastClick">
      <!--ta bort denna när ej behövs mer, anv för att få koord utskrivna till mina städer-->
      <p>
        Postition klickad: X = {{ lastClick.x.toFixed(0) }}, Y =
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
      cityToFind: "Stockholm",
      lastClick: null,
      correctLocation: null, //sätts null först och sedan först efter man klickat ger vi den ett värde
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
      this.lastClick = pos; //ta bort denna när ej behövs mer, anv för att få koord utskrivna till mina städer
      this.correctLocation = this.currentMap.cities[this.cityToFind]; // tillagd för att sätta correctLocation till Sthlm vid tryck (sen rätt men nu sthlm sålänge)
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
