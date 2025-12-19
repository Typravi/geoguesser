<template>
  <div class="ScorePanel">
    <h3>{{ title }}</h3>
    <hr />
    <ul>
      <li 
        v-for="p in sortedParticipants" 
        :key="p.playerName"
        :class="{ 'is-me': p.playerName === currentPlayerName }"
      >
        <div class="player-info">
          <span 
            class="color-dot" 
            :style="{ backgroundColor: p.color }"
          ></span>
          <span class="name">{{ p.playerName }}</span>
        </div>
        <span class="score">{{p.totalScore || 0 }} p</span>
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
  title: String,
},
  computed: {
  sortedParticipants() {
    // Sorterar så att spelaren med LÄGST poäng (minst avstånd) hamnar först
    return [...this.participants].sort(
      (a, b) => (a.totalScore || 0) - (b.totalScore|| 0)
    );
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
  max-width: 200px;
  
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