<template>
  <div class="GeoMapView">
    <header class="header">
      <h1>GeoMap (under utveckling hehe)</h1>
      <p>Spelad världsdel: {{ continent }}</p>
      <p>Klicka på: {{ cityToFind }}</p>
      <div>
        <p v-if="timerActive">Tid kvar: {{ timeLeft }} s</p>
        <p v-else>Väntar på andra spelare...</p>
        </div>
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
        :timer-active="timerActive"
        :time-left="timeLeft"
        :disabled = "!timerActive"
        :participants="participants"
        @map-click="handleMapClick"
      />
      <!--timer-->
  

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
      timeLeft: null, //Sätt antal sekunder
      timeInterval: null,
      timerActive: true,
      participants: [],
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
  socket.on("participantsUpdate", (participants) => {
  this.participants = participants;
});

},

methods: {
  handleMapClick(pos) {
    // Stoppa timern
    // if (this.timerInterval) {
    //   clearInterval(this.timerInterval);
    //   this.timerInterval = null;
    // }
    // this.timerActive = false; // timern försvinner

    this.lastClick = pos; //--> senaste klicket sparas lokalt 

    // this.correctLocation = this.currentMap.cities[this.cityToFind];
    // this.distance = calculateDistance(this.lastClick, this.correctLocation);
  },

  startTimer() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
  this.timeLeft = 10;
  this.timerActive = true;

  this.timerInterval = setInterval(() => {
    if (this.timeLeft <= 0) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.timerActive = false;

      if (this.lastClick) {
        socket.emit("finalClick", {
          lobbyID: this.lobbyID,
          playerName: this.playerName,
          locationGuess: this.lastClick
        });
      }

      return;
    }
    this.timeLeft--;
  }, 1000);
}
}
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
