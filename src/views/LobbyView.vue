<template>
  <div class="outerWrapperLobby">
    <header class="logoHeader">
      <LogoComponent :text="uiLabels.ourName" />
    </header>

    <div class="leftGridUpper">
      <ul>
        <li v-for="p in participants" :key="p.playerName" class="participant">
          <span class="color-dot" :style="{ backgroundColor: p.color }"></span>
          {{ p.playerName }}
        </li>
      </ul>
    </div>

    <div class="middleGridUpper">
      <div class="showID">
        <h1>{{ uiLabels.gameID }}: {{ lobbyID }}</h1>
      </div>
      <div class="hostArea">
        <p>Hostname: {{ hostName }}</p>
      </div>
    </div>

    <div class="rightGridUpper">
      <div class="infoArea">
        <p>{{ uiLabels.contPlayed }} {{ continent }}</p>
        <p>{{ uiLabels.numOfQuestions }} {{ numberOfQuestions }}</p>
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
    </div>

    <div class="WaitForHost"></div>
    <p v-if="playerName != hostName">
      {{ uiLabels.waitFor }} {{ hostName }} {{ uiLabels.toStart }}
    </p>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  components: { LogoComponent },
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
    };
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
  },
  methods: {
    startGame() {
      console.log("Start game by clicking"); //check
      socket.emit("startGame", this.lobbyID); //skickar "startGame" till server med aktuell lobby
    },
  },
};
</script>
<style scoped>
.outerWrapperLobby {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  grid-template-areas:
    "header header header"
    "leftGridUpper middleGridUpper rightGridUpper"
    "leftGridLower middleGridLower rightGridLower";
}

.logoHeader {
  grid-area: header;
}

.participant {
  display: flex;
  align-items: center;
}
.leftGridUpper {
  grid-area: leftGridUpper;
  display: flex;
  align-items: center;
  justify-content: center;
}

.middleGridUpper {
  grid-area: middleGridUpper;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.hostArea {
  grid-area: middleGridUpper;
}

.waitForHost {
  grid-area: middleGridLower;
}

.rightGridUpper {
  grid-area: rightGridUpper;
  display: flex;
  justify-content: center;
  align-items: center;
}

.middleGridLower {
  grid-area: middleGridLower;
  display: flex;
  justify-content: center;
  align-items: center;
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
</style>
