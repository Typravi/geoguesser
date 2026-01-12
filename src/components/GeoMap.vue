<template>
  <div
    class="outerMapWrapper"
    :style="{
      '--map-width': continentData.originalWidth + 'px',
      '--map-height': continentData.originalHeight + 'px',
      '--map-image': `url(${continentData.image})`,
      '--map-scale': scale,
    }"
  >
    <div class="mapWrapper">
      <div class="map" ref="map" @click="onClick">
        <svg class="svgLayerOnMap">
          <g v-if="!timerActive && correctLocation">
            <line
              class="lineBetweenDots"
              v-for="p in participantsWhoHasClicked"
              :key="p.playerName"
              :x1="correctLocation.x"
              :y1="correctLocation.y"
              :x2="p.latestClick.x"
              :y2="p.latestClick.y"
              :style="{ stroke: p.color }"
            />
          </g>
        </svg>
      </div>
      
      <div id="dots">
        <div
          v-if="timerActive && locationGuess.x !== null"
          class="guessMarker"
          :style="{
            left: locationGuess.x + 'px',
            top: locationGuess.y + 'px',
          }"
        ></div>

        <template v-for="p in participants" :key="p.playerName">
          <div
            v-if="p.latestClick && !timerActive"
            class="guessMarker"
            :style="{
              left: p.latestClick.x + 'px',
              top: p.latestClick.y + 'px',
              backgroundColor: p.color,
            }"
            :title="p.playerName"
          >
          </div>

          <div
            v-if="p.latestClick && !timerActive && locationGuess.x !== null"
            class="nameLabel"
            :style="{
              left: p.latestClick.x + 'px',
              top: p.latestClick.y + 'px',
              backgroundColor: p.color,
            }"
          >
            {{ p.playerName }}
          </div>
        </template>

        <div
          v-if="!timerActive && correctLocation"
          class="correctMarker"
          :style="{
            left: correctLocation.x + 'px',
            top: correctLocation.y + 'px',
          }"
        ></div>
        <div
          v-if="!timerActive && correctLocation"
          class="correctCityNameLabel"
          :style="{
            left: correctLocation.x + 'px',
            top: correctLocation.y + 'px',
          }"
        >
          {{ correctCityName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GeoMap",

  props: {
    scale: Number,
    disabled: Boolean,
    timerActive: Boolean,
    timeLeft: Number,
    participants: Array,
    distance: Number,
    continentData: {
      type: Object,
      required: true,
    },
    correctLocation: Object, //tillagd för att ta emot korrekta koordinater från vår förälder GeoMapView
    //tillagd för att ta emot korrekt namn så staden till markören
    correctCityName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      locationGuess: { x: null, y: null },
      hasGuessed: false,
    };
  },

  computed: {
    //participantsWhoHasClicked städar bort folk som inte klickat
    participantsWhoHasClicked() {
      //om participants finns anv den annars ta ny tom array
      //filter går igenom alla participants i participants och lägger till dom som uppfyller villkoret i en ny array
      //villkoret är att om p finns och latestclick finns och latestclick koordinaterna är nummer (ej string elr null exempelvis)
      return (this.participants || []).filter(
        (p) =>
          p?.latestClick &&
          typeof p.latestClick.x === "number" &&
          typeof p.latestClick.y === "number"
      );
    },
  },

  methods: {
    onClick(event) {
      if (this.disabled) return;
      //  if (this.hasGuessed) return;

      const rect = this.$refs.map.getBoundingClientRect();

      const xScaled = event.clientX - rect.left;
      const yScaled = event.clientY - rect.top;

      const x = xScaled / this.scale;
      const y = yScaled / this.scale;

      this.locationGuess = { x, y };

      this.hasGuessed = true;

      this.$emit("map-click", { x, y });
    },

    handleMapClick(pos) {
      socket.emit("mapClick", {
        lobbyID: this.lobbyID,
        playerName: this.playerName,
        locationGuess: pos,
      });
    },
  },
};
</script>

<style scoped>
.outerMapWrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: auto; /* verkar som att auto/scroll gör samma här, är lite osäker dock */
}

.mapWrapper {
  display: inline-block;
  width: calc(
    var(--map-width) * var(--map-scale)
  ); /* OBS viktigt!! detta sätter till orginalstorlek så flex kan centrera */
  height: calc(
    var(--map-height) * var(--map-scale)
  ); /*!!! samma som ovan (orginal flr centrering men visas endå scaled rent visuellt) */
  transform-origin: top left;
  transform: scale(var(--map-scale));

  /* rosa border ligger kvar för CSS förståelse, man ser bara ena hörnet pga resten täcks av annat */
  /* OBS sätt inget overflow här*/
}

.map {
  width: var(--map-width);
  height: var(--map-height);
  background-image: var(--map-image);
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}

.guessMarker {
  position: absolute;
  width: 5%; /*Av kartans storlek, lika stor oavsett skärmstorlek*/
  height: 5%; /*kanske vill vi hellre ha vh? tror de heter vh (beror på skärmen ist)*/
  /*Notera att här vill vi i framtiden hämta färg från user (alla har varsin)*/
  border-radius: 50%;

  transform: translate(-50%, -50%);
  /*transform ovan centrerar punkten i klicket, se referens: https://stackoverflow.com/questions/46184458/transform-translate-50-50*/
  pointer-events: none;
  /*Raden ovan gör pricken "genomskinlig för klick" dvs fångar ej klick, vet ej om de behövs sen men tänker kan va bra till när flera gamers är med?*/
  background-color: black;
}
.correctMarker {
  position: absolute;
  width: 5%;
  height: 5%;
  background-color: rgb(4, 251, 0);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.correctCityNameLabel {
  position: absolute;
  transform: translate(
    20%,
    -100%
  ); /*Flyttar namnet bort från pricken relativt sin egen storlek */
  color: #0f1a0f;
  font-weight: bold;
  background: #01fa01;
  padding: 2px 6px;
  font-size: 40px;
  white-space: nowrap;
  border-radius: 0%;
  pointer-events: none;
  border: 2px solid white;
}

.svgLayerOnMap {
  position: absolute;
  inset: 0; /*ist för å manuellt sätta top,bottom,left, right till 0*/
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.lineBetweenDots {
  /* stroke: red;*/
  stroke-dasharray: 2 2;
  stroke-width: 6;
}

.distanceLabel {
  position: absolute;
  transform: translate(
    10%,
    10%
  ); /*kan bli tokigt med olika längd så eventuellt byta */
  background: black;
  color: white;
  padding: 2px 6px;
  font-size: 40px;
  white-space: nowrap;
}

.nameLabel {
  position: absolute;
  transform: translate(
    20%,
    -100%
  ); /*kan bli tokigt med olika längd så eventuellt byta */
  color: #0f1a0f;
  padding: 2px 6px;
  font-size: 35px;
  font-style: italic;
  font-weight: bold;
  white-space: nowrap;
  border-radius: 50%;
}
</style>
