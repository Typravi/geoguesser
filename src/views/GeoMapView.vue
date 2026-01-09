<template>
  <div class="outerWrapperGeo">
    <header class="header">
      <div class="whichCity">
        <p v-if="timerActive">
          {{ uiLabels.clickOn }}
          <span class="cityName">{{ displayCityName }}</span>
        </p>
        <p v-else>
          <span class="cityName">{{ displayCityName }}</span>
        </p>
      </div>

      <div
        class="timerBox"
        v-if="timerActive && timeLeft !== null"
        :class="{ hurry: timeLeft <= 3 }"
      >
        <span class="timerInner">{{ timeLeft }}</span>
      </div>

      <div class="whichRound" v-if="round && numberOfQuestions && timerActive">
        <p>
          {{ uiLabels.whichRound }} <br />
          {{ round }} / {{ numberOfQuestions }}
        </p>
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

        <div class="waitForHostNewRound">
          <p
            v-if="
              playerName !== participants?.[0]?.playerName &&
              round !== numberOfQuestions &&
              !timerActive
            "
          >
            {{ uiLabels.waitFor }} {{ participants?.[0]?.playerName }}
            {{ uiLabels.toStartRound }}
          </p>
        </div>
      </div>
    </header>

    <main class="map-area">
      <GeoMap
        :key="round"
        v-if="currentMap"
        :scale="scale"
        :continent-data="currentMap"
        :correct-location="correctLocation"
        :correctCityName="displayCityName"
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
        v-if="!timerActive"
        :participants="participants"
        :currentPlayerName="playerName"
        :uiLabels="uiLabels" 
        
      />
    </div>
    <footer>
      <div class="footerLogo">
        <LogoComponent :text="uiLabels.ourName || ''" />
      </div>
    </footer>
  </div>
</template>

<script>
import GeoMap from "../components/GeoMap.vue";
import ScorePanel from "../components/ScorePanel.vue";
import LogoComponent from "../components/LogoComponent.vue";
import continentData from "../assets/maps_public.json";
import { calculateDistance } from "../assets/logic";
import { calculatePunishment } from "../assets/logic";

import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer")); // ändrat från localhost till min lokala IP-adress

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

      if (this.continent === "Planet earth") {
        const idx = (Number(this.round) || 1) - 1;
        const city = this.cities?.[idx];
        if (!city?.continent) return null;

        return continentData[city.continent] ?? null;
      }

      return continentData[this.continent] ?? null;
    },

    displayCityName() {
      const cityNames = this.uiLabels?.cityNamesLang;
      if (!cityNames || !this.cityToFind) return this.cityToFind || "";
      return cityNames[this.cityToFind] ?? this.cityToFind;
    },
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
      this.continent = lobby?.continent ?? null;
      this.numberOfQuestions = lobby?.numberOfQuestions ?? null;
      this.cities = Array.isArray(lobby?.cities) ? lobby.cities : [];
      this.round = Number(lobby?.round) || 1;
      this.timePerRound = lobby?.time ?? 10;

      const idx = this.round - 1;
      const city = this.cities[idx];

      this.cityToFind = city?.name ?? null;
      this.correctLocation = city?.coordinates ?? null;

      // Only start timer when we actually have round data
      if (this.cityToFind && this.correctLocation) {
        this.startTimer();
      }

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
  beforeUnmount() {
    // Sluta lyssna på servern när vi lämnar kartan
    // Annars kan gamla timers eller lyssnare ligga kvar och störa nästa runda
    socket.off("gameData");
    socket.off("participantsUpdate");
    socket.off("resultsView");

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
                this.currentMap.originalHeight ** 2
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

.score-panel {
  position: absolute;       
  top: 100px;             
  left: 15px;             
  width: auto;
  z-index: 10;
  pointer-events: none;    
  display: flex;
  justify-content: flex-end;
}

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
  --hud-offset: clamp(90px, 14vw, 170px);
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

@media (max-width: 50em) {
  .score-panel {
    position: static;       /* Slutar flyta, lägger sig i flödet under kartan */
    width: 100%;            /* Tar hela bredden */
    margin: 0;
    padding: 10px 0;        /* Lite luft */
    
    display: flex;
    justify-content: center; /* Centrerar boxen */
    pointer-events: auto;    /* Vanlig klickbarhet */
  }
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
  position: absolute;
  top: clamp(8px, 1.6vw, 16px);

  /* Ankare i mitten */
  left: 50%;
  transform: translateX(clamp(140px, 22vw, 260px));

  width: clamp(44px, 7vw, 72px);
  height: clamp(44px, 7vw, 72px);
  font-size: clamp(1.2rem, 3.5vw, 2.5rem);

  display: grid;
  place-items: center;

  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.timerBox.hurry .timerInner {
  color: red;
  animation: shake 0.3s infinite; /* beroende på hur snabb skakningen ska vara*/
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

.whichRound {
  position: absolute;
  top: clamp(8px, 1.6vw, 16px);

  left: 25%;
  transform: translateX(calc(var(--hud-offset) * -1));

  width: clamp(52px, 8vw, 86px);
  height: clamp(52px, 8vw, 86px);

  background: rgba(0, 0, 0, 0.8);
  border-radius: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  display: grid;
  place-items: center;
  text-align: center;

  font-size: clamp(0.85rem, 1.3vw, 1rem);
  font-weight: 1000;
  padding: 0;
}

/* Bara för att få texten snyggt centrerad */
.whichRound p {
  margin: 0;
  line-height: 1.15;
}

.whichCity {
  color: white;
  font-size: 1.5rem;
  margin: 0 auto;
  line-height: 0.01;
  letter-spacing: 0.05em;
  opacity: 0.9;
  width: fit-content;
}
</style>
