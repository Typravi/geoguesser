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

import Swal from "sweetalert2";


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
      timeLeft: null,
      timerInterval: null,
      timerActive: true,
      roundEndsAt: null,
      participants: [],
      hostName: "",
      round: null,
      roundScore: 0,
      hasSentFinalClick: false,
      leaveConfirm: false,
      hostDiscardConfirm: false,
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
      this.roundEndsAt = lobby?.roundEndsAt ?? null;

      const idx = this.round - 1;
      const city = this.cities[idx];

      this.cityToFind = city?.name ?? null;
      this.correctLocation = city?.coordinates ?? null;

      this.lastClick = null;
      this.distance = null;
      this.hasSentFinalClick = false; 
      // Only start timer when we actually have round data
      if (this.cityToFind && this.correctLocation && this.roundEndsAt) {
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

    socket.on("lobbyDiscardedByHost", () => {
      Swal.fire({
        title: this.uiLabels.discardGameDoneTitle,
        text: this.uiLabels.discardGameDoneTitleParticipant,
        icon: "info",
      }).then(() => {
        this.leaveConfirm = true; 
        this.$router.push("/");
      });
    }); 

    socket.on("playerLeft", ({playerName}) => {
      const host = this.participants?.[0]?.playerName;
      if (this.playerName !== host) return; 

      Swal.fire({
        text: playerName + this.uiLabels.playerLeftGame,
        toast: true, 
        position: "top-start",
        icon: "info",
        showConfirmButton: false,
        timer: 1500
      });
    });
  },

  beforeRouteLeave(to, from, next) {
    if (to.path.startsWith("/ResultsView")) return next();
    const host = this.participants?.[0]?.playerName;
    //HOST
    if (this.playerName === host ){
      if (this.discardConfirm) return next();
      next(false);
      this.confirmDiscardGame();
      return;
    }
    //PLAYER
    if (this.leaveConfirm) return next();
    next(false);
    this.confirmLeaveGame();
  },

  beforeUnmount() {
    // Sluta lyssna på servern när vi lämnar kartan
    // Annars kan gamla timers eller lyssnare ligga kvar och störa nästa runda
    socket.off("gameData");
    socket.off("participantsUpdate");
    socket.off("resultsView");
    socket.off("lobbyDiscardedByHost");
    socket.off("playerLeft");


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
    },

    startTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.timerActive = true;
      const update = () => {
        if (!this.roundEndsAt) return;
        
        const msLeft = this.roundEndsAt - Date.now(); //antal minisekunder kvar av klockan
        this.timeLeft = Math.max(0, Math.ceil(msLeft / 1000)); //gör om millisekudner till sekunder

      if (this.timeLeft == 0) {
        this.stopTimer();
        this.finishRound();
        }
      };
      update();
      this.timerInterval = setInterval(update,250);}, //uppdaterar så att tiden "tickar" ner

    stopTimer(){ 
      if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      }
      
      this.timerActive = false;
      },

    finishRound(){
      if (this.timerInterval) {
      clearInterval(this.timerInterval);        this.timerInterval = null;
      }
      if(this.lastClick){
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
          return;
        }
        const maxDistance = Math.sqrt(
          this.currentMap.originalWidth ** 2 + this.currentMap.originalHeight ** 2);
          const noClickScore = calculatePunishment(maxDistance);

        socket.emit("finalClick", {
          lobbyID: this.lobbyID,
          playerName: this.playerName,
          locationGuess: null,
          roundScore: noClickScore,
          });
        },
        
        confirmDiscardGame(){
          Swal.fire({
          title: this.uiLabels.uSure,
          text: this.uiLabels.discardGameInfo,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "hotpink",
          cancelButtonColor: "#d33",
          confirmButtonText: this.uiLabels.discardGameConfirmButton,
          cancelButtonText: this.uiLabels.cancel,
          }).then((result) => {
          if (result.isConfirmed) {
          this.discardConfirm = true; 
          socket.emit("discardLobby", this.lobbyID);

          Swal.fire({
            title: this.uiLabels.discardGameDoneTitle,
            text: this.uiLabels.discardGameDoneTextHost,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          this.$router.push("/"); } 
          else this.discardConfirm = false
      });
    },
        confirmLeaveGame() {
        Swal.fire({
        title: this.uiLabels.uSure,
        text: this.uiLabels.leaveGameInfo,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "hotpink",
        cancelButtonColor: "#d33",
        confirmButtonText: this.uiLabels.leaveGameConfirmButton,
        cancelButtonText: this.uiLabels.cancel,
      }).then((result) => {
        if (result.isConfirmed) {
        this.leaveConfirm = true;
        socket.emit( "playerLeaveLobby", {
        lobbyID: this.lobbyID,
        playerName: this.playerName,
      });
      this.$router.push("/"); } 
      else this.leaveConfirm = false
      });
    },
   }
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
  flex-direction: column;
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
  display: flex;
  justify-content: center;
  align-items: center;
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
    position: static; /* Slutar flyta, lägger sig i flödet under kartan */
    width: 100%; /* Tar hela bredden */
    margin: 0;
    padding: 10px 0; /* Lite luft */

    display: flex;
    justify-content: center; /* Centrerar boxen */
    pointer-events: auto; /* Vanlig klickbarhet */
  }
}

.button {
  display: inline-block;
  width: 12rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  background-color: var(--button-purplecolor);
  border-radius: 10px;
  text-decoration: none;
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
  top: 50px;
  left: 75%;
  transform: translateX(calc(var(--hud-offset) * 1));

  width: 8rem;
  height: 8rem;
  font-size: 4rem;

  display: grid;
  place-items: center;

  background: rgba(7, 27, 156, 0.8);
  border-radius: 20%;
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
  top: 50px;
  right: 75%; 
  transform: translateX(calc(var(--hud-offset) * -1));
  width: 7rem;
  height: 7rem;
  background: rgba(7, 27, 156, 0.8);
  border-radius: 50%;
  font-size: 1.5rem;
  color: white;
  display: grid;
  place-items: center;
}

/* Bara för att få texten snyggt centrerad */
.whichRound p {
  margin: 0;
  line-height: 1.15;
}

.whichCity {
  margin: 0 auto;
  max-width: calc(100% - 3rem); /*hela headerns bredd - 12 rem*/
  line-height: 1.1;
  color: white;
  font-size: 2rem;
  font-family: var(--logo-font), system-ui, sans-serif;


}

@media (max-width: 50em) {

  .timerBox{
    top: 12px;
    left: 60%; 
    width: 4rem;
    height: 4rem;
    font-size: 2rem;
  }

  .whichRound {
    top: 12px;
    right: 60%; 
    width: 4rem;
    height: 4rem;
    font-size: 0.95rem;
  }

  .whichCity{
    max-width: calc(100% - 6.5rem); /* justera vid behov */
    margin: 0 auto;
    text-align: center;
    font-size: 1.5rem;
  }

  

  
}


</style>
