<template>
  <div>
    {{lobbyID}}
    <div v-if="!joined">
      <input type="text" v-model="userName">
      <button v-on:click="participateGame">
        {{ this.uiLabels.participateInPoll }}
      </button>
    </div>
    <div v-if="joined">
      <p>Waiting for host to start poll</p>
      {{ participants }}
  </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      lobbyID: "inactive lobby",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: []
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => this.participants = p );
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.pollId) );
    socket.emit( "joinPoll", this.pollId );
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
