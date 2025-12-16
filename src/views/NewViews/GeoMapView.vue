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
      <!--timer-->
      <div>
      <p>Tid kvar: {{ timeLeft }} s</p>
      </div>

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
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "GeoMapView",

  components: {
    GeoMap,
  },

  data() {
    return {
      continent:null,
      cityToFind:null, 
      scale: 0.35,
      lastClick: null,
      correctLocation: null,
      distance: null,
      lobbyID: null,
      playerName: "",
      numberOfQuestions:null,
      timeLeft: 30, //Sätt antal sekunder
      timeInterval: null,
    };
  },

  computed: {
    currentMap() {
      return continentData[this.continent] || null;
    },
  },
  created() {
    this.lobbyID = this.$route.params.lobbyID;
    this.playerName = this.$route.params.playerID;

    socket.emit('joinGame', this.lobbyID);

  // lyssna på gameData i GeoMapView också
  socket.on('gameData', (lobby) => {
    this.continent = lobby.continent;
    this.numberOfQuestions = lobby.numberOfQuestions;
    this.cities = lobby.cities;
    this.startTimer();

    console.log(
      "GeoMapView created for lobby", this.lobbyID,
      "and player", this.playerName,
      "in continent", this.continent,
      "with the cities:", this.cities
    );

    // här kan du också välja stad utifrån rätt kontinent:
    // const map = continentData[this.continent];
    // const randomCity = getRandomCity(map.map);
    this.cityToFind = this.cities[0].name;
    this.correctLocation = this.cities[0].coordinates;
  });
},

  methods: {
    handleMapClick(pos) {
      if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
      //in hit ska vårt mapclick komma från GeoMap sen
      this.lastClick = pos; //ta bort denna när ej behövs mer, anv för att få koord utskrivna till mina städer
      this.correctLocation = this.currentMap.cities[this.cityToFind]; // tillagd för att sätta correctLocation till Sthlm vid tryck (sen rätt men nu sthlm sålänge)
      this.distance = calculateDistance(this.lastClick, this.correctLocation);
    },

    startTimer() { //fungerar endast lokalt - så måste skrivas ut så den anpassas efter klick/spelarsynk etc 

      this.timerInterval = setInterval(() => {
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
        return; }
      this.timeLeft--;}, 
      1000); //varje millisekund
    }
  },
};
</script>

<style scoped>
.GeoMapView {
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
