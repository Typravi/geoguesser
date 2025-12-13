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

  <div>
    <button @click = "startGame"> <!--start knapp - (synlig för alla)-->
      {{ uiLabels.startGame }}
    </button>
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

    
    socket.on("gameStart", lobbyID => { //startar spelet - från servern 
      console.log("Game start for lobby", lobbyID); //check
      this.$router.push("/GeoMapView"); //pushar alla spelare till GeoMapView
    })
    
  },
  methods: {
    startGame() {
      console.log("Start game by clicking"); //check
      socket.emit("startGame", this.lobbyID); //skickar "startGame" till server med aktuell lobby
    }
  }

}


   
    
  
  
  

</script>
