<template>
  
  <div>
    <h1>Lobby {{ lobbyID }}</h1>
    <p>Namn: {{ name }}</p>
    <p>Antal frågor: {{ numberOfQuestions }}</p>
  </div>



    {{lobbyID}}
    <div>
      <p>Waiting for host to start poll</p>
      {{ participants }}
  </div>

</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");


export default {
  props: ['lobbyID', 'name', 'numberOfQuestions'], // tar emot props från route
  mounted() {
    console.log('LobbyID:', this.lobbyID);
    console.log('Namn:', this.name);
    console.log('Antal frågor:', this.numberOfQuestions);},
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      lobbyID: "inactive lobby",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      participants: []
    }
  },
  created: function () {
    this.lobbyID = this.$route.params.lobbyID;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => this.participants = p );
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.pollId) );
    socket.emit( "joinGame", this.lobbyID );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateGame: function () {
      socket.emit( "participateGame", {lobbyID: this.lobbyID, name: this.Name} )
      this.joined = true;
    }
  }
}
</script>
