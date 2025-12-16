<template>
  <div>

    <p>Antal frågor: {{ numberOfQuestions }}
                  <button @click="decreaseAmount">-</button>
                  <button @click="increaseAmount">+</button>
  </p>


  <p>
    <label for="name">Name</label><br>
    <input type="text"  v-model="playerName" id ="playerName" placeholder="Enter your name">
  </p>

<p>

<button v-on:click="goToLobby" :disabled="!playerName.trim()">
  {{ uiLabels.createLobby}}
  </button>

</p>
  </div>


</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName:"",
      uiLabels: {},
      numberOfQuestions: 1,
      lobbyID:null
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("lobbyData", data => {
      console.log("Lobby created:", data);
      this.$router.push(`/lobby/${this.lobbyID}/${data.hostName}`); 
    });
    
    socket.emit( "getUILabels", this.lang );

   
  },
  methods: {

    getLobbyID() {
    const lobbyID = Math.floor(100000 + Math.random() * 900000);;
    return lobbyID;
    },

    goToLobby() {
 
  this.lobbyID= this.getLobbyID();
  socket.emit("createLobby", {
    lobbyID: this.lobbyID,
    lang: this.lang,
    playerName: this.playerName,
    numberOfQuestions: this.numberOfQuestions
  });


  },
    increaseAmount() {
    if (this.numberOfQuestions < 10) {
    this.numberOfQuestions++;}
    },
    decreaseAmount() {
    if (this.numberOfQuestions > 1) {
      this.numberOfQuestions--;}
  }
  }
}
</script>