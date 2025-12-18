<template>
  <div>
    <p>
      <label for="name">{{ uiLabels.yourName }}</label
      ><br />
      <input
        type="text"
        v-model="playerName"
        id="playerName"
        :placeholder="uiLabels.enterYourName"
      />
    </p>

    <p>
      <label for="lobbyID"> {{ uiLabels.gameID }} </label><br />
      <input
        type="text"
        @input="checkgameID"
        id="lobbyID"
        v-model="lobbyID"
        :placeholder="uiLabels.enterGameID"
      />
    </p>
    <p v-if="gameIsChecked && !gameExists" class="error-message">
      <!--  lägg till felmedellande här-->
    </p>
    <p>
      <button
        v-on:click="joinGame"
        :disabled="!gameExists || !gameIsChecked || !playerName.trim()"
      >
        {{ uiLabels.joinGame }}
      </button>
    </p>
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "JoinGameView",
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
    socket.emit("getUILabels", this.lang);

    socket.on("playerJoined", () => {
      this.$router.push(`/lobby/${this.lobbyID}/${this.playerName}`);
    });

    socket.on("lobbyError", (msg) => {
      console.log("Lobby error:", msg);
      alert(msg);
    });
  },
  methods: {
    checkgameID() {
      this.lobbyID = this.lobbyID.replace(/\D/g, "");

      console.log("[JoinGameView] checkgameID, lobbyID=", this.lobbyID);

      if (this.lobbyID.length < 6) {
        this.gameIsChecked = false;
      }
      if (this.lobbyID.length === 6) {
        console.log(
          "[JoinGameView] emitting validateLobbyID for",
          this.lobbyID
        );
        socket.emit("validateLobbyID", this.lobbyID, (exists) => {
          console.log(
            "[JoinGameView] validateLobbyID callback, exists=",
            exists
          );
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
