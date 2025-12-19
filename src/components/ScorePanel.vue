<template>
  <div class="ScorePanel">
    <h3>{{ scorePanelTitle }}</h3>
    <hr />
    <ul>
      <li 
        v-for="player in sortedParticipants" 
        :key="player.playerName"
        :class="{ 'is-me': player.playerName === currentPlayerName }"
      >
        <div class="player-info">
          <span 
            class="color-dot" 
            :style="{ backgroundColor: player.color }"
          ></span>
          <span class="name">{{ player.playerName }}</span>
        </div>
        <span class="score">{{ player.playerScore || 0 }} p</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ScorePanel",
  props: {
  participants: Array,
  currentPlayerName: String,
  scorePanelTitle: String,
},
  computed: {
    sortedParticipants() {
      
      return [...this.participants].sort(
        (a, b) => (b.points || 0) - (a.points || 0)); //gör en kopia av deltagarlistan och sorterar den så att spelaren med högst poäng hamnar först,
    }
  }
  
};
</script>

<style scoped>
.ScorePanel {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 180px;
  color: white;
}

h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #aaa;
}

hr {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 10px 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-family: sans-serif;
}

.player-info {
  display: flex;
  align-items: center;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.is-me .name {
  font-weight: bold;
  color: #00ffcc; /* Markeringsfärg för dig själv */
}

.points {
  font-weight: bold;
  margin-left: 15px;
}
</style>