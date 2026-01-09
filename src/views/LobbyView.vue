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

    <div class="leftGridUpper">
      <div class="hasJoinedList">
        <h4>{{ uiLabels.whoHasJoined }}</h4>
        <ul>
          <li v-for="p in participants" :key="p.playerName" class="participant">
            <span
              class="color-dot"
              :style="{ backgroundColor: p.color }"
            ></span>
            {{ p.playerName }}
          </li>
        </ul>
      </div>
    </div>

    <div class="middleGridUpper">
      <div class="showID">
        <h1>{{ uiLabels.gameID }}: {{ lobbyID }}</h1>
      </div>
      <div class="hostArea">
        <div v-if="playerName != hostName">
          <p>{{ uiLabels.showHostName }} {{ hostName }}</p>
          <p>{{ uiLabels.showYourName }} {{ playerName }}</p>
        </div>
        <div v-else>
          <p>{{ hostName }} {{ uiLabels.uAreHost }}</p>
        </div>
      </div>
    </div>

    <div class="rightGridUpper">
      <div class="infoArea">
        <h4>{{ uiLabels.contPlayed }}</h4>
        <p>{{translatedContinent}}</p>
        <h4>{{ uiLabels.numOfQuestions }}</h4>
        <p>{{ numberOfQuestions }}</p>
        <h4>{{ uiLabels.numOfTime }}</h4>
        <p>{{ numOfTime }} s</p>
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
          @click="playerLeaveLobby"
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
  components: { LogoComponent, LanguageComponent, FAQComponent},
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
    };
  },
   computed: {
    
  translatedContinent() {
    if (this.continent === "africa") {
      return this.uiLabels.africa || "Africa";
    } 
    else if (this.continent === "europe") {
      return this.uiLabels.europe || "Europe";
    } 
    else if (this.continent === "Planet earth") {
      return this.uiLabels.planetEarth || "Planet Earth";
    }
    else if (this.continent === "asia") {
      return this.uiLabels.asia || "Asia";
    }
    return this.continent; 
  }
},
  created() {
    this.lobbyID = this.$route.params.lobbyID;
    this.playerName = this.$route.params.playerID;

    socket.on("gameData", (lobby) => {
      console.log("Lobby data received:", lobby);
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
      console.log("Received participants:", p);
    });

    socket.emit("getUILabels", this.lang);
    socket.emit("joinGame", this.lobbyID);

    socket.on("gameStart", (lobbyID) => {
      //startar spelet - från servern
      console.log("Game start for lobby", lobbyID); //check
      this.$router.push(`/GeoMapView/${this.lobbyID}/${this.playerName}`); //pushar alla spelare till GeoMapView
    });

    socket.on("lobbyDiscardedByHost", () => {
      Swal.fire({
        title: this.uiLabels.discardLobbyDoneTitle,
        text: this.uiLabels.discardLobbyDoneTitleParticipant,
        icon: "info",
      }).then(() => {
        this.$router.push("/");
      });
    });
  },
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om SV isf EN annars SV (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    startGame() {
      console.log("Start game by clicking"); //check
      socket.emit("startGame", this.lobbyID); //skickar "startGame" till server med aktuell lobby
    },

    playerLeaveLobby(){
      socket.emit("playerLeaveLobby", {
        lobbyID: this.lobbyID,
        playerName: this.playerName
      });
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
          socket.emit("discardLobby", this.lobbyID);

          Swal.fire({
            title: this.uiLabels.discardLobbyDoneTitle,
            text: this.uiLabels.discardLobbyDoneTextHost,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          this.$router.push("/");
        }
      });
    },
  },
};
</script>
<style scoped>
/* Notera att...

  padding: 1em;
  margin: 1em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);

  ...är det som gör den blurrade bakgrunden
  
  Detta kanske vi inte vill ha på hela gridArean som de är nu?
  Men den får ligga där sålänge*/

.outerWrapperLobby {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "header header header"
    "leftGridUpper middleGridUpper rightGridUpper"
    "leftGridLower middleGridLower rightGridLower";
}

.participant {
  display: flex;
  align-items: baseline;
}

.leftGridUpper {
  grid-area: leftGridUpper;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
  margin: 1em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.middleGridUpper {
  grid-area: middleGridUpper;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1em;
  margin: 1em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.rightGridUpper {
  grid-area: rightGridUpper;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
  margin: 1em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.leftGridLower {
  grid-area: leftGridLower;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.middleGridLower {
  grid-area: middleGridLower;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hasJoinedList {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.waitForHost {
  color: lightskyblue;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: var(--player-color);
}
.button {
  display: inline-block;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  background-color: var(--button-purplecolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.leaveLobbyButton {
  width: 6rem;
  text-decoration: none; /*  font-weight: normal; */
  transition: 0.2s ease;
  margin-bottom: 2rem;
  font-size: smaller;
  background-color: rgba(0, 0, 139, 0.25);
}
.discardLobbyButton {
  display: inline-block;
  width: 8rem;
  padding: 0.8rem 0.8rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-weight: normal;
  font-size: smaller;
  transition: 0.2s ease;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 139, 0.25);
}
.startGameButton {
  background-color: var(--createbutton-color);
}
.startGameButton:hover {
  background-color: var(--createbutton-color-hover);
}
</style>
