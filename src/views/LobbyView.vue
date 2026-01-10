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
      } else if (this.continent === "Oceania") {
        return this.uiLabels.Oceania || "Oceania";
      }
      return this.continent;
    },
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

  beforeUnmount() {
    // VIKTIGT: Stäng av lyssnarna så de inte lever kvar när vi byter sida
    socket.off("gameStart");
    socket.off("participantsUpdate");
    socket.off("gameData");
    socket.off("lobbyDiscardedByHost");
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

    playerLeaveLobby() {
      socket.emit("playerLeaveLobby", {
        lobbyID: this.lobbyID,
        playerName: this.playerName,
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
.lobby-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  min-width: 14rem;
  min-height: 18rem;
  padding: 1.5rem;
  margin-bottom: 1rem;

  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-align: center;
}

.showID {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.label-text {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  font-weight: bold;
  margin: 0 0 0.5rem 0; /* Lite avstånd ner till siffrorna */
}

h1 {
  font-size: 3.5rem; /* Stora siffror */
  margin: 0;
  line-height: 1;
  font-weight: bold;
  letter-spacing: 2px;
}

.hostArea {
  margin-top: auto;
  width: 100%;
}

.hostArea hr {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  margin: 1rem 0 0.5rem 0;
  width: 50%; /* Linjen blir inte lika bred som rutan */
  margin-left: auto;
  margin-right: auto;
}

/* --- SETTINGS BOX (HÖGER) --- */

.big-text {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0;
}

.small-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  gap: 2.5rem;
  margin-top: 3rem;
}

´ .small-info h4 {
  font-size: 0.75rem;
  margin-bottom: 0.2rem;
  opacity: 0.7;
}

.small-info .big-text {
  font-size: 1.4rem;
}

.participants-list {
  list-style: none;
  padding: 0;

  width: fit-content;
  margin: 0 auto;
}

.participant {
  display: flex;
  align-items: center;

  justify-content: flex-start;

  margin-bottom: 0.8rem;
  font-weight: bold;
  font-size: 1.1rem;
  width: 100%;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid white;
}

.startGameButton {
  background-color: var(--createbutton-color);
  width: 14rem;
  font-size: 1.3rem;
  padding: 1rem;
  margin-top: 1rem;
}
.startGameButton:hover {
  background-color: var(--createbutton-color-hover);
}

.leave-area {
  margin-top: 1rem;
}

.leaveLobbyButton,
.discardLobbyButton {
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: auto;
  min-width: 10rem;
  padding: 0.8rem;
}
.leaveLobbyButton:hover,
.discardLobbyButton:hover {
  background-color: rgba(255, 0, 0, 0.4);
}

.waitForHost {
  color: #fff;
  font-style: italic;
  margin-top: 1rem;
}
</style>
