<template>
  <div>

    <p>Antal frågor: {{ numberOfQuestions }}
                  <button @click="decreaseAmount">-</button>
                  <button @click="increaseAmount">+</button>
  </p>


  <p>
    <label for="name">Name</label><br>
    <input type="text" id="name" name="fn" required="required" placeholder="Enter your name">
</p>
<p>

<button v-on:click="goToLobby">
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
      numberOfQuestions: 0,
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "pollData", data => this.pollData = data );
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {

    getLobbyID() {
    const lobbyID = Math.floor(Math.random() * 1000000);
    return lobbyID;
    },

    goToLobby() {
  const lobbyID = this.getLobbyID(); 
  socket.emit("goToLobby", {
    lobbyID: lobbyID,
    lang: this.lang,
    name: this.name,
    numberOfQuestions: this.numberOfQuestions
  });

  this.$router.push(`/lobby/${lobbyID}`);

  },
    increaseAmount() {
    if (this.numberOfQuestions < 10) {
    this.numberOfQuestions++;}
    },
    decreaseAmount() {
    if (this.numberOfQuestions > 0) {
      this.numberOfQuestions--;}
  }
  }
}
</script>