<template>
  <div>

    <p>Antal frågor: {{ numberOfQuestions }}
                  <button @click="decreaseAmount">-</button>
                  <button @click="increaseAmount">+</button>
  </p>


  <p>
    <label for="name">Name</label><br>
    <input type="text"  v-model="name" id ="name" placeholder="Enter your name">
  </p>

<p>

<button v-on:click="goToLobby" :disabled="!name.trim()">
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
      name:"",
      uiLabels: {},
      numberOfQuestions: 1,
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    
    socket.emit( "getUILabels", this.lang );

   
  },
  methods: {

    getLobbyID() {
    const lobbyID = Math.floor(100000 + Math.random() * 900000);;
    return lobbyID;
    },

    goToLobby() {
  const lobbyID = this.getLobbyID(); 
  socket.emit("createLobby", {
    lobbyID: lobbyID,
    lang: this.lang,
    name: this.name,
    numberOfQuestions: this.numberOfQuestions
  });

  socket.emit("participateInGame", {
        lobbyID,
        userName: this.name
         });

  this.$router.push(`/lobby/${lobbyID}`);

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