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
      <div class="numberArea">
        <p class="uiLabNumQ">{{ uiLabels.numOfQuestions }}</p>
        <div class="numberButtons">
          <button class="button minusButton" @click="decreaseAmount">-</button>
          <p>{{ numberOfQuestions }} </p>
          <button class="button plusButton" @click="increaseAmount">+</button>
        </div>
      </div>
      <div class="continentArea">
        <p>{{ uiLabels.chooseContinent }}</p>
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
      <div class="numberTimeArea">
        <p class="uiLabNumT">{{ uiLabels.numOfTime }}</p>
        <div class="timerButtons">
          <button class="button minusButtonTime" @click="decreaseTime">-</button>
          <p>{{ numOfTime }} s</p>
          <button class="button plusButtonTime" @click="increaseTime">+</button>
        </div>
      </div>

    </div>
    <div class="flexInnerWrapper2">
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
        <button
          class="button createGameButton"
          v-on:click="goToLobby"
          :disabled="!playerName.trim()"
        >
          {{ uiLabels.createGame }}
        </button>
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
      const continents = ["africa", "europe", "Planet earth", "asia"];
      const currentIndex = continents.indexOf(this.continent);
      const nextIndex = (currentIndex + 1) % continents.length;
      this.continent = continents[nextIndex];
    },

    choosePreviousContinent() {
  const continents = ["africa", "europe", "Planet earth", "asia"];
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

.flexInnerWrapper2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.uiLabNumQ {
  margin: 1em;
}

/*-------- Nedan har använts för att underlätta styling, låt gärna ligga kvar tills vi är helt klara 
.nameArea {
  background-color: aliceblue;
}
.continentArea {
  background-color: aqua;
}
.numberArea {
  background-color: yellow;
}

.createArea {
  background-color: blue;
}
*/

.button {
  width: 12rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}



.leftArrow,
.rightArrow,
.minusButton,
.plusButton, 
.minusButtonTime, 
.plusButtonTime {
  background-color: var(--button-purplecolor);
  margin: 1rem;
  width: 1.5em;
  height: 1.5em;
  padding: 0;
  color: black;
  border-radius: 50%;
  font-size: 1.2rem;
}

.numberArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 12rem;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.continentArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 10%;
  min-width: 12rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.continent-text {
  display: inline-block;
  width: 7rem;         
  text-align: center;   
  

}

/* Området för timer rutan */
.numberTimeArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-width: 12rem;
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px)
}

.numberButtons, 
.timerButtons {
  display: flex;
  flex-direction: row;
}

.inputNameBox {
  color: black;
  background-color: rgb(222, 211, 238);
}

.createGameButton {
  margin-top: 2rem;
  background-color: var(--createbutton-color);
}
.createGameButton:hover {
  background-color: var(--createbutton-color-hover);
}

.buttonArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-bottom: 2rem;
}

.goBackButton {
  display: inline-block;
  width: 6rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: normal;
  transition: 0.2s ease;
  margin-top: 6rem;
  background-color: rgba(0, 0, 139, 0.25);
}

</style>
