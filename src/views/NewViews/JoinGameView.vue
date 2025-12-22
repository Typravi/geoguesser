<template>
  <div class="flexWrapper">
    <div class="innerWrapper">
      <div class="enterNameArea">
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
      </div>
      <div class="game-IDArea">
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
      </div>
      <div class="joinArea">
        <p v-if="gameIsChecked && !gameExists" class="error-message">
          <!--  lägg till felmedellande här-->
        </p>
      </div>
    </div>
    <p>
      <button
        class="button joinButton"
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

<style>
.flexWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4rem;
}

.innerWrapper {
  display: flex;
  flex-direction: row;
  margin-top: 4rem;
}

.enterNameArea {
  border-radius: 10%;
  padding: 1em;
  margin: 1em;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.game-IDArea {
  padding: 1em;
  margin: 1em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.button {
  width: 12rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.joinButton {
  background-color: var(--joinbutton-color);
}
</style>
