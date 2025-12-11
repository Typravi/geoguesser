<template>
  
  <div>
    <h1>Lobby {{ lobbyID }}</h1>
    <p>Hostname: {{ hostName }}</p>
    <p>Antal frågor: {{ numberOfQuestions }}</p>
  </div>
    <div>
      <ul>
      <li v-for="p in participants" :key="p.name">
        {{ p.name }}
      </li>
    </ul>
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
      lobbyID: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      hostName: "",
      numberOfQuestions: 0,
    }
  },
  created() {
    this.lobbyID = this.$route.params.lobbyID;

    socket.on('lobbyData', lobby => {
      console.log('Lobby data received:', lobby);
      this.hostName = lobby.hostName;
      this.numberOfQuestions = lobby.numberOfQuestions;
    });

    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.on("participantsUpdate", p => {this.participants = p; 
    console.log("Received participants:", p);
});

    socket.on("startPoll", () => this.$router.push("/lobby/" + this.lobbyID));

    socket.emit("getUILabels", this.lang);
  
    socket.emit("joinLobby", this.lobbyID);
    
  }
}


   
    
  
  methods: {
    
    }
  

</script>
