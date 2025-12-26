<template>
  <div class="wrapOuterResultView">
    <header class="header well-done">
      <h2>{{ uiLabels.wellDone }}</h2>
    </header>
    <main class="mainArea">
      <div class="ResultListArea">
        <ul class="finalResultList">
          <li v-for="(p, index) in finalResults" :key="p.playerName">
            <!--uiLabels.rankLabels?.[index] här har vi ett ? för annars kraschar koden när uiLabels är undefined-->
            <span class="ranking"> {{ uiLabels.rankLabels?.[index] }}</span>
            <span class="nameInRankingList"> {{ p.playerName }} </span>
            <span class="scoreInRankingList">{{ p.totalScore }} pixels</span>
          </li>
        </ul>
      </div>
    </main>

    <footer>
      <div class="footerLogo">
        <LogoComponent :text="uiLabels.ourName" />
      </div>
    </footer>
  </div>
</template>

<script>
import LogoComponent from "../../components/LogoComponent.vue";
import io from "socket.io-client";

const socket = io("localhost:3000");

export default {
  components: { LogoComponent },
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      playerName: "",
      lobbyID: null,
    };
  },
  created() {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);

    this.lobbyID = this.$route.params.lobbyID;
    this.playerName = this.$route.params.playerID;

    socket.emit("joinGame", this.lobbyID);

    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
    });
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
.footerLogo {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0.5rem;
}
.wrapOuterResultView {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.mainArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 4rem;
}

footer {
  width: 100%;
  flex-shrink: 0;
  /*Tar annars större plats än jag vill vill*/
}

header {
  font-family: var(--logo-font);
  color: var(--logo-color);
}

.ResultListArea {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.5em;
  margin: 0.5em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  font-family: var(--logo-font), monospace;
  color: rgba(0, 0, 136, 0.668);
}
.finalResultList {
  list-style: none;
  padding: 1rem 2rem;
  margin: 0;
}
.finalResultList li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}
.ranking {
  width: 4rem;
  flex-shrink: 0;
  /*En bestämd width o flexshrink noll "reserverar" plats så namnen 
  utanför pallen hamnar centrerat med de på pallen */
}
.nameInRankingList,
.scoreInRankingList {
  font-variant: small-caps;
}
/*Nedan ser till att olika långa namn nt skapar kaoz i listan m.a.p bredd*/
.nameInRankingList {
  flex: 1;
}
</style>
