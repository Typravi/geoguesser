<template>

  <div>
    <p>
      <label for="name">Name</label><br>
      <input type="text"  v-model="userName" id ="userName" placeholder="Enter your name">
  </p>

  <p>
      <label for="lobbyID">Lobby</label><br>
      <input type="text" @input="checkgameID" id="lobbyID" v-model="lobbyID" placeholder="Lobby ID"> 
         
  </p>
  <p v-if="gameIsChecked && !lobbyExists" class="error-message">
      <!--  lägg till felmedellande här-->
  </p>
      <p>
  <button v-on:click="joinLobby" :disabled="!lobbyExists || !gameIsChecked || !userName.trim()">
    {{ uiLabels.joinLobby}}
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
        userName:"",
        lobbyID: "",  
        uiLabels: {},
        lobbyExists: false,
        gameIsChecked: false,
      }
    },
    created: function () {
      socket.on( "uiLabels", labels => this.uiLabels = labels );
      socket.emit( "getUILabels", this.lang );
    },
    methods: {

      checkgameID() {

      this.lobbyID = this.lobbyID.replace(/\D/g, '');

      console.log('[JoinGameView] checkgameID, lobbyID=', this.lobbyID);

      if(this.lobbyID.length >= 0 && this.lobbyID.length < 6) {
        this.gameIsChecked = false
      }
      if (this.lobbyID.length === 6) {
        console.log('[JoinGameView] emitting validateLobbyID for', this.lobbyID);
        socket.emit('validateLobbyID', this.lobbyID, (exists) => {
        console.log('[JoinGameView] validateLobbyID callback, exists=',exists);
        this.lobbyExists = exists;
        this.gameIsChecked = true;
          });
        };
    },
  
    joinLobby() {
  // 1. Gå med i lobbyn (så servern skickar lobbyData, questionUpdate, etc)
  socket.emit("joinLobby", this.lobbyID);

  // 2. RegistreraR spelaren som deltagare
  socket.emit("participateInGame", {
    lobbyID: this.lobbyID,
    userName: this.userName
  });

  // 3. Navigera till LobbyView där allt visas
  this.$router.push(`/lobby/${this.lobbyID}`);
}


  }}
  </script>