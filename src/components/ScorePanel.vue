<template>
  <div class="ScorePanel">
    <h3>{{ title }}</h3>
    
    <div class="list-header">
      <span class="col-name">{{ uiLabels?.player || 'Player' }}</span>
      
      <span class="col-score roundtext">{{ uiLabels?.whichRound || 'Round' }}</span>
      
      <span class="col-score">{{ uiLabels?.total || 'Total' }}</span>
    </div>
    
    <hr/>
    
    <ul>
      <li 
        v-for="p in sortedParticipants" 
        :key="p.playerName"
        :class="{ 'is-me': p.playerName === currentPlayerName }"
      >
        <div class="player-info col-name">
          <span 
            class="color-dot" 
            :style="{ backgroundColor: p.color }"
          ></span>
          <span class="name">{{ p.playerName }}</span>
        </div>
        
        <span class="score col-score round-score">
          {{ p.roundScore !== undefined ? p.roundScore : '-' }}
        </span>

        <span class="score col-score">
          {{ p.totalScore || 0 }}
        </span>
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
  /* Ta bort fast bredd för att låta den växa lite med kolumnerna */
  min-width: 220px;
  color: white;
  width: 100%;
  max-width: 350px; 
}

.list-header {
  display: flex;             
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #fff;                
  font-weight: bold;
  padding-bottom: 5px;
  margin-top: 10px;            
}

h3 {
  margin: 0;
  font-size: 1.4rem;           
  color: #fff;
  text-align: center;         
  font-weight: bold;
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

/* Flex-layout för kolumnerna */
.col-name {
  flex: 2; /* Namnet får ta mest plats */
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.col-score {
  flex: 1;
  text-align: right;
  min-width: 50px;
}

.roundtext {
  color: #bbb; 
}
.round-score {
  color: #bbb; 
  font-size: 0.9em;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.is-me .name {
  font-weight: bold;
  color: #00ffcc; 
}
</style>