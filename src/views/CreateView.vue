<template>
  <div class="page-wrapper CreateView">
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
        <h4>{{ uiLabels.numOfQuestions }}</h4>
        <div class="numberButtons">
          <button class="button minusButton" @click="decreaseAmount">-</button>
          <p>{{ numberOfQuestions }} </p>
          <button class="button plusButton" @click="increaseAmount">+</button>
        </div>
      </div>
      <div class="glassBox">
        <h4>{{ uiLabels.chooseContinent }}</h4>
        <div class="continentChooserButton">
          <button class="button leftArrow" @click="choosePreviousContinent">
            &lt;
          </button>
  
          <span class="continent-text">
            {{ translatedContinent }}
          </span>

         <button class="button rightArrow" @click="chooseNextContinent">
          &gt;
        </button>
    </div>
      </div>
 <!--Tillagd knapp för timer -->
      <div class="glassBox">
        <h4 >{{ uiLabels.numOfTime }}</h4>
        <div class="timerButtons">
          <button class="button minusButtonTime" @click="decreaseTime">-</button>
          <p>{{ numOfTime }} s</p>
          <button class="button plusButtonTime" @click="increaseTime">+</button>
        </div>
      </div>

    </div>
    <div class="CreateView-flexInnerWrapper2">
      <div class="nameArea">
        <p>
          <label for="name">{{ uiLabels.yourName }}</label
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

      <div class="buttonArea">
        <div class="Game-buttons">
          <button
            class="button create-button"
            v-on:click="goToLobby"
            :disabled="!playerName.trim()"
          >
            {{ uiLabels.createGame }}
          </button>
        </div>
        <router-link to="/" class="button goBackButton">
          {{ uiLabels.goBack }}
        </router-link>
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

export default {
  name: "CreateView",
  components: { LogoComponent, LanguageComponent, FAQComponent },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName: "",
      uiLabels: {},
      numberOfQuestions: 1,
      numOfTime: 10, 
      lobbyID: null,
      continent: "europe",
      round: null,
    };
  },

  computed: {
    // Fixar så att kontinentnamnet visas på rätt språk
  // Denna funktion översätter det valda värdet till ett snyggt label
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
    else if (this.continent === "oceania") {
      return this.uiLabels.oceania || "Oceania";
    }
    else if (this.continent === "south_america") {
      return this.uiLabels.southAmerica || "South America";
    }
    else if (this.continent === "north_america") {
      return this.uiLabels.northAmerica || "North America";
    }
    return this.continent; // Fallback om något går fel
  }
},
  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("gameData", (data) => {
      console.log("Lobby created:", data);
      this.$router.push(`/lobby/${this.lobbyID}/${data.hostName}`);
    });

    socket.emit("getUILabels", this.lang);
  },
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om SV isf EN annars SV (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    getGameID() {
      const lobbyID = Math.floor(100000 + Math.random() * 900000);
      return lobbyID;
    },

    goToLobby() {
      this.lobbyID = this.getGameID();

      socket.emit("createGame", {
        lobbyID: this.lobbyID,
        lang: this.lang,
        playerName: this.playerName,
        numberOfQuestions: this.numberOfQuestions,
        continent: this.continent,
        round: 1,
        time: this.numOfTime
      });
    },

    increaseAmount() {
      if (this.numberOfQuestions < 10) {
        this.numberOfQuestions++;
      }
    },
    decreaseAmount() {
      if (this.numberOfQuestions > 1) {
        this.numberOfQuestions--;
      }
    },
    chooseNextContinent() {
      const continents = ["africa", "europe", "Planet earth", "asia", "oceania", "south_america", "north_america"];
      const currentIndex = continents.indexOf(this.continent);
      const nextIndex = (currentIndex + 1) % continents.length;
      this.continent = continents[nextIndex];
    },

    choosePreviousContinent() {
  const continents = ["africa", "europe", "Planet earth", "asia", "oceania", "south_america", "north_america"];
  const currentIndex = continents.indexOf(this.continent);
  const prevIndex = (currentIndex - 1 + continents.length) % continents.length;
  this.continent = continents[prevIndex];
},

    increaseTime() {
      if (this.numOfTime< 60) {  //maxgräns på 1 min
        this.numOfTime+= 5;
      }
    },
    decreaseTime() {
      if (this.numOfTime > 5) {
        this.numOfTime -= 5;
      }
  },

  },
    
}

</script>

<style>

/*------Behövs denna fortfarande? inget verkar ändras när jag kommenterar ut den
.CreateView-flexInnerWrapper2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
------ */

</style>
