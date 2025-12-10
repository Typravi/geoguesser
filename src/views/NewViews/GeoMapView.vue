<template>
  <div class="GeoMapView">
    <header class="header">
      <h1>GeoMap (under utveckling hehe)</h1>
      <p>Spelad världsdel: {{ continent }}</p>
      <p>Klicka på: {{ cityToFind }}</p>
      <div class="initiateNew">
        <!--obs lägg in knapp här (för skojs skull)-->
      </div>
    </header>

    <main class="map-area">
      <GeoMap
        v-if="currentMap"
        :scale="scale"
        :continent-data="currentMap"
        :correct-location="correctLocation"
        @map-click="handleMapClick"
      />
    </main>
    <footer v-if="lastClick">
      <!--ta bort footern när ej behövs mer, anv för att få koord utskrivna så jag ser vad som händer-->
      <!--notera att även ur data och handlemapclick behövs det städas när footern tas bort -->
      <p>
        Postition klickad: X = {{ lastClick.x.toFixed(0) }}, Y =
        {{ lastClick.y.toFixed(0) }}
      </p>
      <p>
        Korrekt position: X = {{ correctLocation.x.toFixed(0) }}, Y =
        {{ correctLocation.y.toFixed(0) }}
      </p>
      <p>Avstånd i pixlar: {{ this.distance }}</p>
    </footer>
  </div>
</template>

<script>
import GeoMap from "../../components/GeoMap.vue";
import continentData from "../../assets/maps.json";
import { calculateDistance } from "../../assets/logic";
import { getRandomContinent } from "../../assets/logic";
import { getRandomCity } from "../../assets/logic";

export default {
  name: "GeoMapView",

  components: {
    GeoMap,
  },

  data() {
    const randomContinent = getRandomContinent(continentData);
    const randomCity = getRandomCity(randomContinent.map); //obs .map måste ligga kvar pga vad getrandomCity förväntar sig

    //detta uppdateras varje gång man refreshar sidan
    return {
      continent: randomContinent.name,
      cityToFind: randomCity.name,
      scale: 0.35,
      lastClick: null,
      correctLocation: null,
      distance: null,
    };
  },

  computed: {
    currentMap() {
      return continentData[this.continent] || null;
    },
  },

  methods: {
    handleMapClick(pos) {
      //in hit ska vårt mapclick komma från GeoMap sen
      this.lastClick = pos; //ta bort denna när ej behövs mer, anv för att få koord utskrivna till mina städer
      this.correctLocation = this.currentMap.cities[this.cityToFind]; // tillagd för att sätta correctLocation till Sthlm vid tryck (sen rätt men nu sthlm sålänge)
      this.distance = calculateDistance(this.lastClick, this.correctLocation);
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

/* Rubrik + current continent-text */
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
