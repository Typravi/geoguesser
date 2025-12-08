<template>

  <div>
    <p>
      <label for="name">Name</label><br>
      <input type="text" id="name" name="fn" required="required" placeholder="Enter your name">
  </p>

  <p>
      <label for="lobbyID">Lobby</label><br>
      <input type="text" @input="lobbyID = lobbyID.replace(/\D/g, '')" maxlength=6 id="lobbyID" v-model="lobbyID" placeholder="LobbyID"> 
         <!-- Hitta sätt att endast tillåta siffror -->
  </p>

  <p>
  <button v-on:click="joinLobby">
    {{ uiLabels.joinGame}}
    </button>
  </p>
    </div>
  
  
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("localhost:3000");
  
  export default {
    name: 'JoinGameView',
    data: function () {
      return {
        lang: localStorage.getItem("lang") || "en",
        name:"",
        lobbyID: "",  
        uiLabels: {},
      }
    },
    created: function () {
      socket.on( "uiLabels", labels => this.uiLabels = labels );
      socket.emit( "getUILabels", this.lang );
    },
    methods: {
  
    joinLobby() {
    socket.emit("joinLobby", {
      lobbyID: this.lobbyID,
      lang: this.lang,
      name: this.name,
    });
  
    this.$router.push(`/lobby/${lobbyID}`);
  
    },
  }}
  </script>