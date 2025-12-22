<template>
  <div class="flexOuterWrapper">
    <header class="logoHeader">
      <LogoComponent :text="uiLabels.ourName" />
    </header>
    <div class="flexInnerWrapper1">
      <div class="continentArea">
        <p>{{ uiLabels.chooseContinent }}</p>
        <div class="continentChooserButton">
          <button class="button leftArrow" @click="choseNextContinent">
            <
          </button>
          {{ continent }}
          <button class="button rightArrow" @click="choseNextContinent">
            >
          </button>
        </div>
      </div>

      <div class="numberArea">
        <p class="uiLabNumQ">{{ uiLabels.numOfQuestions }}</p>
        <div class="numberButtons">
          <button class="button minusButton" @click="decreaseAmount">-</button>
          <p>{{ numberOfQuestions }}</p>
          <button class="button plusButton" @click="increaseAmount">+</button>
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
      <div class="createArea">
        <div class="createGameButtonArea">
          <button
            class="button createGameButton"
            v-on:click="goToLobby"
            :disabled="!playerName.trim()"
          >
            {{ uiLabels.createGame }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import io from "socket.io-client";
import { getRandomCity } from "@/assets/logic.js";
import continentData from "@/assets/maps.json";
const socket = io("localhost:3000");

export default {
  name: "CreateView",
  components: { LogoComponent },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName: "",
      uiLabels: {},
      numberOfQuestions: 1,
      lobbyID: null,
      continent: "europe",
      cities: [],
      round: null,
    };
  },
  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("gameData", (data) => {
      console.log("Lobby created:", data);
      this.$router.push(`/lobby/${this.lobbyID}/${data.hostName}`);
      console.log("Lista med alla städer", this.cities);
    });

    socket.emit("getUILabels", this.lang);
  },
  methods: {
    getGameID() {
      const lobbyID = Math.floor(100000 + Math.random() * 900000);
      return lobbyID;
    },

    goToLobby() {
      this.lobbyID = this.getGameID();
      this.getCitiesForContinentInArray();
      socket.emit("createGame", {
        lobbyID: this.lobbyID,
        lang: this.lang,
        playerName: this.playerName,
        numberOfQuestions: this.numberOfQuestions,
        continent: this.continent,
        cities: this.cities,
        round: 1,
      });
    },

    getCitiesForContinentInArray() {
      this.cities = [];

      const continentKey = this.continent.toLowerCase();
      const continentObj = continentData[continentKey];

      if (!continentObj) {
        console.error("Okänd kontinent:", this.continent);
        return;
      }

      for (let i = 0; i < this.numberOfQuestions; i++) {
        const city = getRandomCity(continentObj);
        this.cities.push(city);
      }
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
    choseNextContinent() {
      const continents = ["africa", "europe", "Planet earth"];
      const currentIndex = continents.indexOf(this.continent);
      const nextIndex = (currentIndex + 1) % continents.length;
      this.continent = continents[nextIndex];
    },
  },
};
</script>

<style>
.flexOuterWrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: flex-start;
  gap: 5rem;
}
.logoHeader {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem 2rem;
}

.flexInnerWrapper1 {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

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
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.leftArrow,
.rightArrow,
.minusButton,
.plusButton {
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
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.continentArea {
  border-radius: 10%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.numberButtons {
  display: flex;
  flex-direction: row;
}

.inputNameBox {
  color: black;
  background-color: rgb(222, 211, 238);
}

.createGameButton {
  background-color: var(--createbutton-color);
}
</style>
