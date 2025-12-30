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
            <li v-for="(p, index) in finalResults" :key="p.playerName">
              <!--uiLabels.rankLabels?.[index] här har vi ett ? för annars kraschar koden när uiLabels är undefined-->
              <!--hmm men u har jagt till fem st ranklabels nu hade vi kunnat ta bort det, men kanske ha kvar för stabilitet?-->
              <span class="ranking"> {{ uiLabels.rankLabels?.[index] }}</span>
              <span class="nameInRankingList"> {{ p.playerName }} </span>
              <!-- <span class="scoreInRankingList">{{ p.totalScore }} Score </span> -->
              <!--Jag tycker inte att poänget(score) behövs? eller vill man se det?-->
            </li>
          </ul>
        </div>
      </main>
    </div>
    <div class="rightArea">
      <div class="buttonArea">
        <router-link to="/" class="button quitButton">
          {{ uiLabels.quitLabel }}
        </router-link>
      </div>
    </div>

    <div class="footerArea">
      <footer>
        <div class="footerLogo">
          <LogoComponent :text="uiLabels.ourName" />
        </div>
      </footer>
    </div>
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
  font-size: larger;
}

.leftArea {
  grid-area: leftArea;
}

.middleArea {
  grid-area: middleArea;
  display: flex;
  justify-content: center;
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
  /*Tar annars större plats än jag vill vill*/
}

header {
  font-family: var(--logo-font);
  color: var(--logo-color);
}

.ResultListArea {
  margin-top: 6rem;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.5em;
  min-width: 10em;
  min-height: 10em;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
  font-family: monospace;
  font-weight: bold;
  font-size: 1.4rem;
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
.buttonArea {
  margin-top: auto;
  padding-bottom: 2rem;
}

.quitButton {
  display: inline-block;
  width: 6rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
  margin: 2rem 2rem 2rem 2rem;
  background-color: rgba(0, 0, 139, 0.511);
}
</style>
