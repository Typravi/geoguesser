<template>
  <div class="gridStyleWrapperResultView">
    <header class="header wellDone">
      <h1>{{ uiLabels.wellDone }}</h1>
    </header>
    <div class="leftArea"></div>
    <div class="middleArea">
      <main>
        <div class="ResultListArea">
          <ul class="finalResultList">
            <li
              v-for="(p, index) in finalResults"
              :key="p.playerName"
              :class="{
                'gold-rank': index === 0,
                'silver-rank': index === 1,
                'bronze-rank': index === 2,
              }"
            >
              <span class="ranking"> {{ uiLabels.rankLabels?.[index] }}</span>
              <span class="nameInRankingList"> {{ p.playerName }} </span>
              <span class="scoreInRankingList">{{ p.totalScore }} p </span>
            </li>
          </ul>
        </div>
      </main>

      <div class="buttonArea">
        <div class="Game-buttons">
          <button
            v-if="playerName === hostName"
            @click="playAgain"
            class="button playAgainButton"
          >
            {{ uiLabels.playAgainLabel }}
          </button>
          <button class="button quitButton" @click="quitGame">
            {{ uiLabels.quitLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="footerArea">
    <footer>
      <div class="footerLogo">
        <LogoComponent :text="uiLabels.ourName" />
      </div>
    </footer>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import io from "socket.io-client";
import Swal from "sweetalert2";


const socket = io(sessionStorage.getItem("dataServer")); // ändrat från localhost till min lokala IP-adress

export default {
  components: { LogoComponent },
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      playerName: "",
      lobbyID: null,
      hostName: "",
      allowRouteLeave: false
    };
  },
  created() {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);

    this.lobbyID = this.$route.params.lobbyID;
    this.playerName = this.$route.params.playerID;

    socket.emit("joinGame", this.lobbyID);

    socket.once("participantsUpdate", (participants) => {
      this.participants = participants;
    });

    socket.on("gameData", (lobby) => {
      this.hostName = lobby.hostName;
    });

    socket.on("gameReset", (lobby) => {
      this.$router.push(`/lobby/${this.lobbyID}/${this.playerName}`);
    });
  },
  beforeRouteLeave(to, from, next) {
  if (this.allowRouteLeave) return next();
  next(false);

  Swal.fire({
    icon: "info",
    title: this.uiLabels.sorryGameEndedTitle,
    text: this.uiLabels.sorryGameEndedText,
    confirmButtonText: this.uiLabels.ok
  });
},


  //ser till att gamla spelomgångar inte spökar för den nya.
  beforeUnmount() {
    socket.off("gameReset");
    socket.off("participantsUpdate");
    socket.off("gameData");
  },

  methods: {
    playAgain() {
      this.allowRouteLeave = true;    
      socket.emit("playAgain", this.lobbyID);
    },

    quitGame() {
      this.allowRouteLeave = true;    
      socket.emit("playerLeaveLobby", {
        lobbyID: this.lobbyID,
        playerName: this.playerName,
      });

      this.$router.push("/");
    },
  },
  // Förklaring till Computed: anv pga då görs den bara när just participants körs/ändras, method hade körts varje rendering
  // https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/Vue_computed_properties
  //[...]--> skapar kopia ist för ändra orginal arrayen
  computed: {
    finalResults() {
      return [...this.participants].sort((a, b) => a.totalScore - b.totalScore);
    },
  },
};
</script>

<style>
.gridStyleWrapperResultView {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "leftArea middleArea rightArea"
    "footerArea footerArea footerArea";
  min-height: 100vh;
}

.header {
  grid-area: header;
}

.wellDone {
  font-size: 2.5rem;
}

.leftArea {
  grid-area: leftArea;
}

.middleArea {
  grid-area: middleArea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
}

.middleArea .buttonArea {
  margin-top: 2rem;
  padding-bottom: 0;
}

.rightArea {
  grid-area: rightArea;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footerArea {
  grid-area: footerArea;
}

footer {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;

  /*Tar annars större plats än jag vill vill*/
}

header {
  font-family: var(--logo-font);
  color: var(--logo-color);
}
</style>
