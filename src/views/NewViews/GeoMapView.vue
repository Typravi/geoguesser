<template>
  <div class="outerWrapperGeo">
    <header class="header">
      <h1>GeoMap hehe</h1>

      <div class="whichCity">
        <p v-if="timerActive">{{ uiLabels.clickOn }} <span class="cityName">{{ displayCityName }}</span></p>
        <p v-else><span class="cityName">{{ displayCityName }}</span></p>
      </div>
      
      
      <!-- Gamla timern ifall den föredras 
      <div class="timerShower">
        <p v-if="timerActive">{{ uiLabels.timeText }} {{ timeLeft }}</p>
      </div>
      -->
      
      <div class="initiateNew">
        <button
          class="button nextRoundButton"
          v-if="
            playerName === participants?.[0]?.playerName &&
            round !== numberOfQuestions &&
            !timerActive
          "
          @click="startNextRound"
        >
          {{ uiLabels.nextRoundText }}
        </button>
        <button
          class="button seeResultsButtons"
          v-if="
            playerName === participants?.[0]?.playerName &&
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
      <div class="timerBox" v-if="timerActive && timeLeft !== null"
        :class="{ hurry: timeLeft <= 3 }">
      {{ timeLeft }}
      </div>

      <div class="whichRound"v-if="round && numberOfQuestions">
        <p>
          {{ uiLabels.whichRound }} <br/> {{ round }} / {{ numberOfQuestions }}
        </p>
      </div>


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
    <div class="score-panel">
      <ScorePanel
        :participants="participants"
        :currentPlayerName="playerName"
        :title="uiLabels.scorePanelTitle"
      />
    </div>
    <footer>
      <div class="footerLogo">
        <LogoComponent :text="uiLabels.ourName || ''"  />
      </div>
    </footer>
  </div>
</template>

<script>
import GeoMap from "../../components/GeoMap.vue";
import ScorePanel from "../../components/ScorePanel.vue";
import LogoComponent from "../../components/LogoComponent.vue";
import continentData from "../../assets/maps.json";
import { calculateDistance } from "../../assets/logic";
import { calculatePunishment } from "../../assets/logic";

import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "GeoMapView",

  components: {
    GeoMap,
    ScorePanel,
    LogoComponent,
  },

  data() {
    return {
      lang: localStorage.getItem("lang") || "en",
      uiLabels: {},
      continent: null,
      cityToFind: null,
      scale: 0.35,
      lastClick: null,
      correctLocation: null,
      distance: null,
      lobbyID: null,
      cities: [],
      playerName: "",
      numberOfQuestions: null,
      timePerRound: 10, //default
      timeLeft: null, 
      timerInterval: null,
      timerActive: true,
      participants: [],
      hostName: "",
      round: null,
      roundScore: 0,
    };
  },

  computed: {
  
    currentMap() {
      if (!this.continent) return null;
      if (this.continent == "Planet earth") {
        const city = this.cities[this.round - 1]; // tar fram stadens data för just den rundan - behövs för att vi ska kunna slumpa mellan kontinenter och få upp deras kartor 
        return continentData[city.continent]; //visar kartan som tillhör till den specifika staden 
      }
      return continentData[this.continent] || null;
    },

    displayCityName() {
      return this.uiLabels.cityNamesLang[this.cityToFind] || this.cityToFind
    }

  },

  created() {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);
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
      this.timePerRound = lobby.time;
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
      this.timeLeft = this.timePerRound;
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
              roundScore: Math.round(this.distance),
            });
          } else {
            const maxDistance = Math.sqrt(
              this.currentMap.originalWidth ** 2 +
                this.currentMap.originalWidth ** 2
            );
            const noClickScore = calculatePunishment(maxDistance);

            socket.emit("finalClick", {
              lobbyID: this.lobbyID,
              playerName: this.playerName,
              locationGuess: null,
              roundScore: noClickScore,
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
.outerWrapperGeo {
  min-height: 100vh;

  display: flex;
  flex-direction: column; /* header överst, karta i mitten, coords nederst */
}

/* Rubrik + current continent-text */
.header {
  color: #dbc3c3;
  text-align: center;
  padding: 16px 16px 0;
  position: relative;
}

/*I CSS koden nedan centreras kartan*/
.map-area {
  flex: 1; /* tar upp allt ledigt utrymme mellan header och footer */
  display: flex; /* flex-container */
  justify-content: center; /* centrerar horisontellt */
  align-items: center; /* centrerar vertikalt */
  padding: 16px;
  position: relative; /*tillagd för att timern ska få plats*/

}

.score-panel {
  position: absolute;
  justify-content: center;
  margin: 30px;
}

.button {
  display: inline-block;
  width: 12rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  background-color: var(--button-purplecolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.1rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.footerLogo {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem 1rem;
}

.timerBox {
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  font-size: 4rem;
  font-weight: 1000;

  position: absolute;
  width: 4.5rem;     
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 7rem;
  right: 3rem;
}

.timerBox.hurry{
  color: red;
  animation: shake 0.30s infinite; /* beroende på hur snabb skakningen ska vara*/
}

@keyframes shake {
  0% { transform: translateX(0) }
 25% { transform: translateX(5px) }
 50% { transform: translateX(-5px) }
 75% { transform: translateX(5px) }
 100% { transform: translateX(0) }
}

.whichRound{
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  font-size: 1rem;
  font-weight: 1000;

  position: absolute;
  width: 4rem;     
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 2rem;
  left: 1.5rem;
}

.whichCity{
  color: white;
  font-size: 1.5rem;    
  margin: 0 auto;    
  line-height: 0.01;      
  letter-spacing: 0.05em;
  opacity: 0.9;
  width: fit-content;
}

</style>
