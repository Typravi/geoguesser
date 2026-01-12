<template>
  <div class="page-wrapper LobbyView">
    <header class="app-header">
      <div class="header-lang">
        <LanguageComponent :lang="lang" @switchLang="switchLanguage" />
      </div>
      <LogoComponent :text="uiLabels.ourName" />
      <div class="header-faq">
        <FAQComponent :uiLabels="uiLabels" />
      </div>
    </header>
    <div class="responsive-row">
      <div class="glassBox">
        <h4>{{ uiLabels.whoHasJoined }}</h4>
        <ul class="participants-list">
          <li v-for="p in participants" :key="p.playerName" class="participant">
            <span
              class="color-dot"
              :style="{ backgroundColor: p.color }"
            ></span>
            {{ p.playerName }}
          </li>
        </ul>
      </div>
      <div class="glassBox">
        <div class="showID">
          <p class="label-text">{{ uiLabels.gameID }}</p>
          <h1>{{ lobbyID }}</h1>
        </div>
        <div class="hostArea">
          <hr />
          <div v-if="playerName != hostName">
            <p>{{ uiLabels.showHostName }} {{ hostName }}</p>
            <p>{{ uiLabels.showYourName }} {{ playerName }}</p>
          </div>
          <div v-else>
            <p>
              {{ uiLabels.showYourName }}{{ hostName }} ({{
                uiLabels.uAreHost
              }})
            </p>
          </div>
        </div>
      </div>
      <div class="glassBox">
        <h4>{{ uiLabels.contPlayed }}</h4>
        <p class="big-text">{{ translatedContinent }}</p>

        <div class="small-info">
          <div>
            <h4>{{ uiLabels.numOfQuestions }}</h4>
            <p class="big-text">{{ numberOfQuestions }}</p>
          </div>
          <div>
            <h4>{{ uiLabels.numOfTime }}</h4>
            <p class="big-text">{{ numOfTime }} s</p>
          </div>
        </div>
      </div>
    </div>
    <div class="middleGridLower">
      <button
        class="button startGameButton"
        v-if="playerName === hostName"
        @click="startGame"
      >
        {{ uiLabels.startGame }}
      </button>

      <div class="waitForHost">
        <p v-if="playerName != hostName">
          {{ uiLabels.waitFor }} {{ hostName }} {{ uiLabels.toStart }}
        </p>
      </div>
    </div>
    <div class="leftGridLower">
      <div class="leaveLobby">
        <router-link
          to="/"
          class="button leaveLobbyButton"
          v-if="playerName != hostName"
          @click="confirmLeaveLobby"
        >
          {{ uiLabels.leaveLobby }}
        </router-link>
        <button
          class="button discardLobbyButton"
          v-if="playerName === hostName"
          @click="confirmDiscardLobby"
        >
          {{ uiLabels.discardLobby }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import LanguageComponent from "../components/LanguageComponent.vue";
import FAQComponent from "../components/FAQComponent.vue";
import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer")); // ändrat från localhost till min lokala IP-adress

import Swal from "sweetalert2";

export default {
  name: "LobbyView",
  components: { LogoComponent, LanguageComponent, FAQComponent },
  data: function () {
    return {
      playerName: "",
      lobbyID: "inactive poll",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      hostName: "",
      numberOfQuestions: 0,
      continent: "",
      cities: [],
      numOfTime: 0,
      discardConfirm: false,
      leaveConfirm: false
    };
  },
  computed: {
    translatedContinent() {
      if (this.continent === "africa") {
        return this.uiLabels.africa || "Africa";
      } else if (this.continent === "europe") {
        return this.uiLabels.europe || "Europe";
      } else if (this.continent === "Planet earth") {
        return this.uiLabels.planetEarth || "Planet Earth";
      } else if (this.continent === "asia") {
        return this.uiLabels.asia || "Asia";
      } else if (this.continent === "oceania") {
        return this.uiLabels.oceania || "Oceania";
      } else if (this.continent === "north_america") {
        return this.uiLabels.northAmerica || "North America";
      } else if (this.continent === "south_america") {
        return this.uiLabels.southAmerica || "South America";
      }
      return this.continent;
    },
  },
  created() {
    this.lobbyID = this.$route.params.lobbyID;
    this.playerName = this.$route.params.playerID;

    socket.on("gameData", (lobby) => {
      this.hostName = lobby.hostName;
      this.numberOfQuestions = lobby.numberOfQuestions;
      this.continent = lobby.continent;
      this.cities = lobby.cities;
      this.round = lobby.round;
      this.numOfTime = lobby.time;
      console.log("lista med städer lobby view", this.cities);
    });
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("participantsUpdate", (p) => {
      this.participants = p;
    });
    socket.emit("getUILabels", this.lang);
    //joinGame skickar ut "gamedata" till alla i lobbyn och "participantsUpdate"
    socket.emit("joinGame", this.lobbyID);

    socket.on("gameStart", (lobbyID) => {
      //startar spelet - från servern
      this.$router.push(`/GeoMapView/${this.lobbyID}/${this.playerName}`); //pushar alla spelare till GeoMapView
    });

    socket.on("lobbyDiscardedByHost", () => {
      Swal.fire({
        title: this.uiLabels.discardLobbyDoneTitle,
        text: this.uiLabels.discardLobbyDoneTitleParticipant,
        icon: "info",
      }).then(() => {
        this.leaveConfirm = true; 
        this.$router.push("/");
      });
    });
  
  },
  beforeRouteLeave(to, from, next) { 
    //Så att start - game knappen släpps igenom 
    if(to.path.startsWith("/GeoMapView")) return next();

        //-- HOST -- 
      if (this.playerName == this.hostName) {
      //om discardknappen klickats direkt 
      if(this.discardConfirm) return next(); 
      //--> om man klickar på tillbaka knappen 
      next(false); 
      this.confirmDiscardLobby();
      return;
    }
    // -- PLAYER -
      if(this.leaveConfirm) return next();
      next(false)
      this.confirmLeaveLobby();
  },
  beforeUnmount() {
    // VIKTIGT: Stäng av lyssnarna så de inte lever kvar när vi byter sida
    socket.off("gameStart");
    socket.off("participantsUpdate");
    socket.off("gameData");
    socket.off("lobbyDiscardedByHost");
    socket.off("uiLabels"); 
  },
  
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om SV isf EN annars SV (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    startGame() {
      socket.emit("startGame", this.lobbyID); //skickar "startGame" till server med aktuell lobby
    },
    //Se länken nedan för förklaring
    // https://sweetalert2.github.io/
    confirmDiscardLobby() {
      Swal.fire({
        title: this.uiLabels.uSure,
        text: this.uiLabels.discardLobbyInfo,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "hotpink",
        cancelButtonColor: "#d33",
        confirmButtonText: this.uiLabels.discardLobbyConfirmButton,
        cancelButtonText: this.uiLabels.cancel,
      }).then((result) => {
        if (result.isConfirmed) {
          this.discardConfirm = true; 
          socket.emit("discardLobby", this.lobbyID);

          Swal.fire({
            title: this.uiLabels.discardLobbyDoneTitle,
            text: this.uiLabels.discardLobbyDoneTextHost,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          this.$router.push("/"); } 
          else this.discardConfirm = false
      });
    },
    confirmLeaveLobby() {
      Swal.fire({
        title: this.uiLabels.uSure,
        text: this.uiLabels.leaveLobbyInfo,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "hotpink",
        cancelButtonColor: "#d33",
        confirmButtonText: this.uiLabels.leaveLobbyConfirmButton,
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
  },
};
</script>