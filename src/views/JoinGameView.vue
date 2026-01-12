<template>
  <div class="page-wrapper JoinGameView">
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
      <div class="nameArea">
        <p>
          <label for="playerName">{{ uiLabels.yourName }}</label
          ><br />
          <input
            class="inputNameBox"
            type="text"
            v-model="playerName"
            id="playerName"
            :placeholder="uiLabels.enterYourName"
          />
        </p>
      </div>
      <div class="nameArea">
        <p>
          <label for="lobbyID"> {{ uiLabels.gameID }} </label><br />
          <input
          class="inputNameBox"
            type="text"
            @input="checkgameID"
            id="lobbyID"
            v-model="lobbyID"
            :placeholder="uiLabels.enterGameID"
            maxlength="6"
          />
        </p>
      </div>
    </div>
    <div class="buttonArea">
      <div class="Game-buttons">
        <button class="button join-button"
          v-on:click="joinGame"
          :disabled="!gameExists || !gameIsChecked || !playerName.trim()"
        >
          {{ uiLabels.joinGame }}
        </button>
      </div>
      <router-link to="/" class="button goBackButton">
        {{ uiLabels.goBack }}
      </router-link>
    </div>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import LanguageComponent from "../components/LanguageComponent.vue";
import FAQComponent from "../components/FAQComponent.vue";
import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer")); // ändrat från localhost till min lokala IP-adress

export default {
  name: "JoinGameView",
  components: { LogoComponent, LanguageComponent, FAQComponent},
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName: "",
      lobbyID: "",
      uiLabels: {},
      gameExists: false,
      gameIsChecked: false,
    };
  },
  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("playerJoined", () => {
      this.$router.push(`/lobby/${this.lobbyID}/${this.playerName}`);
    });
    socket.on("lobbyError", (msg) => {
      alert(msg);
    });
    //lyssna först ropa sen
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om SV isf EN annars SV (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    checkgameID() {
      this.lobbyID = this.lobbyID.replace(/\D/g, "");
      if (this.lobbyID.length < 6) {
        this.gameIsChecked = false;
      }
      if (this.lobbyID.length === 6) {
        socket.emit("validateLobbyID", this.lobbyID, (exists) => {
          this.gameExists = exists;
          this.gameIsChecked = true;
        });
      }
    },
    joinGame() {
      socket.emit("participateInGame", {
        lobbyID: this.lobbyID,
        playerName: this.playerName,
      });
    },
  },
};
</script>

