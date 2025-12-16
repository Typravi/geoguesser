<template>
  <div>

    <p>Antal frågor: {{ numberOfQuestions }}
                  <button @click="decreaseAmount">-</button>
                  <button @click="increaseAmount">+</button>
  </p>
  <p>Välj världsdel:</p>
  <p><button @click="choseNextContinent"> < </button>
     {{ continent }}
      <button @click="choseNextContinent"> > </button>
  </p>


  <p>
    <label for="name">Name</label><br>
    <input type="text"  v-model="playerName" id ="playerName" placeholder="Enter your name">
  </p>

<p>

<button v-on:click="goToLobby" :disabled="!playerName.trim()">
  {{ uiLabels.createGame}}
  </button>

</p>
  </div>


</template>

<script>
import io from 'socket.io-client';
import { getRandomCity } from "@/assets/logic.js";
import continentData from "@/assets/maps.json";
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName:"",
      uiLabels: {},
      numberOfQuestions: 1,
      lobbyID:null,
      continent:'europe',
      cities: []
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("gameData", data => {
      console.log("Lobby created:", data);
      this.$router.push(`/lobby/${this.lobbyID}/${data.hostName}`); 
      console.log("Lista med alla städer", this.cities);
    });
    
    socket.emit( "getUILabels", this.lang );

   
  },
  methods: {

    getGameID() {
    const lobbyID = Math.floor(100000 + Math.random() * 900000);
    return lobbyID;
    },

    goToLobby() {
 
  this.lobbyID= this.getGameID();
  this.getCitiesForContinentInArray();
  socket.emit("createGame", {
    lobbyID: this.lobbyID,
    lang: this.lang,
    playerName: this.playerName,
    numberOfQuestions: this.numberOfQuestions,
    continent: this.continent,
    cities: this.cities
  });


  },

  getCitiesForContinentInArray() {
  this.cities = []

  const continentKey = this.continent.toLowerCase()
  const continentObj = continentData[continentKey]

  if (!continentObj) {
    console.error("Okänd kontinent:", this.continent)
    return
  }

  for (let i = 0; i < this.numberOfQuestions; i++) {
    const city = getRandomCity(continentObj)
    this.cities.push(city)
  }
},
    increaseAmount() {
    if (this.numberOfQuestions < 10) {
    this.numberOfQuestions++;}
    },
    decreaseAmount() {
    if (this.numberOfQuestions > 1) {
      this.numberOfQuestions--;}
  },
    choseNextContinent() {
      const continents = ['africa', 'europe', 'Planet earth'];
      const currentIndex = continents.indexOf(this.continent);
      const nextIndex = (currentIndex + 1) % continents.length;
      this.continent = continents[nextIndex];}

  },

    
    }

</script>