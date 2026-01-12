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
import Swal from "sweetalert2";

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

      this.lastClick = pos; 
      console.log(pos);//--> senaste klicket sparas lokalt
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
          console.log

          socket.emit("finalClick", {
          lobbyID: this.lobbyID,
          playerName: this.playerName,
          locationGuess: this.lastClick,
          roundScore: Math.round(this.distance),
          });
          console.log("Last click sent to server", this.lastClick);
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

