<template>
  <div class="GeoMapView">
    <header class="header">
      <h1>GeoMap (under utveckling hehe)</h1>
      <p>{{ uiLabels.clickOn }} {{ cityToFind }}</p>
      <div>
        <p v-if="timerActive">{{ uiLabels.timeText }} {{ timeLeft }}</p>
        <p v-else>{{ uiLabels.pGuessText }}</p>
      </div>
      <div class="initiateNew">
        <button
          v-if="
            playerName === participants[0].playerName &&
            round !== numberOfQuestions &&
            !timerActive
          "
          @click="startNextRound"
        >
          {{ uiLabels.nextRoundText }}
        </button>
        <button
          v-if="
            playerName === participants[0].playerName &&
            !timerActive &&
            round === numberOfQuestions
          "
          @click="startNextRound"
        >
          {{ uiLabels.seeResultsText }}
        </button>
      </div>
    </header>

    <main class="map-area">
      <GeoMap
        :key="round"
        v-if="currentMap"
        :scale="scale"
        :continent-data="currentMap"
        :correct-location="correctLocation"
        :timer-active="timerActive"
        :time-left="timeLeft"
        :disabled="!timerActive"
        :participants="participants"
        :distance="distance"
        @map-click="handleMapClick"
      />
      <!--timer-->
    </main>
    <footer v-if="!timerActive && lastClick">
      <!--ta bort footern när ej behövs mer, anv för att få koord utskrivna så jag ser vad som händer-->
      <!--notera att även ur data och handlemapclick behövs det städas när footern tas bort -->
      <p>{{ uiLabels.distInPix }} {{ this.distance }}</p>
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
      continent: null,
      cityToFind: null,
      scale: 0.35,
      lastClick: null,
      correctLocation: null,
      distance: null,
      lobbyID: null,
      playerName: "",
      numberOfQuestions: null,
      timeLeft: 20, //Sätt antal sekunder
      timerInterval: null,
      timerActive: true,
      participants: [],
      hostName: "",
      round: null,
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

    socket.emit("joinGame", this.lobbyID);

    socket.on("resultsView", (lobby) => {
      console.log("Going to ResultsView", lobby);
      this.$router.push(`/ResultsView/${this.lobbyID}/${this.playerName}`);
    });

    // lyssna på gameData i GeoMapView också
    socket.on("gameData", (lobby) => {
      this.continent = lobby.continent;
      this.numberOfQuestions = lobby.numberOfQuestions;
      this.cities = lobby.cities;
      this.round = lobby.round;
      this.cityToFind = this.cities[this.round - 1].name;
      this.correctLocation = this.cities[this.round - 1].coordinates;
      this.startTimer();

      console.log(
        "GeoMapView created for lobby",
        this.lobbyID,
        "and player",
        this.playerName,
        "in continent",
        this.continent,
        "with the cities:",
        this.cities
      );
    });
    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
    });
  },

  methods: {
    startNextRound() {
      this.lastClick = null;
      socket.emit("startNextRound", {
        lobbyID: this.lobbyID,
      });
    },

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
            this.distance = calculateDistance(
              this.lastClick,
              this.correctLocation
            );
            socket.emit("finalClick", {
              lobbyID: this.lobbyID,
              playerName: this.playerName,
              locationGuess: this.lastClick,
            });
          }

          return;
        }
        this.timeLeft--;
      }, 1000);
    },
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
