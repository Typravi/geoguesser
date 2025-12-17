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
          <!--"v if" nedan för å kolla att vi har klickat(o har en korrekt koordinat med)-->
          <line
            class="lineBetweenDots"
            v-if="!timerActive && correctLocation"
            :x1="correctLocation.x"
            :y1="correctLocation.y"
            :x2="locationGuess.x"
            :y2="locationGuess.y"
          />
        </svg>
      </div>
      <div id="dots">
        <!--skillnad från burger:
    1. v-if gör så att ingen markör skrivs ut om klick ej skett (i burger va den uppe t vänster)
    ? Jag undrar om man bör använda svg circle nedan istället för en vanlig div med border radius 50%??
    https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle-->

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
      v-if="p.latestClick"
      class="guessMarker"
      :style="{
        left: p.latestClick.x + 'px',
        top: p.latestClick.y + 'px',
        backgroundColor: p.color,
       
      }"
      :title="p.playerName"
    ></div>
  </template>

  <div
    v-if="!timerActive && correctLocation"
    class="correctMarker"
    :style="{
      left: correctLocation.x + 'px',
      top: correctLocation.y + 'px',
    }"
  ></div>
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
    
    participants: {
    type: Array,
    default: () => []
  },

    continentData: {
      type: Object,
      required: true,
    },
    correctLocation: Object, //tillagd för att ta emot korrekta koordinater från vår förälder GeoMapView
  },
  data() {
    return {
      locationGuess: { x: null, y: null },
      hasGuessed: false,
    };
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
    locationGuess: pos
  });
}

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
  background-color: aqua;
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
  border: 20px solid pink;
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
  background-color: blue; /*Notera att här vill vi i framtiden hämta färg från user (alla har varsin)*/
  border-radius: 50%;
  
  transform: translate(-50%, -50%);
  /*transform ovan centrerar punkten i klicket, se referens: https://stackoverflow.com/questions/46184458/transform-translate-50-50*/
  pointer-events: none;
  /*Raden ovan gör pricken "genomskinlig för klick" dvs fångar ej klick, vet ej om de behövs sen men tänker kan va bra till när flera gamers är med?*/
}
.correctMarker {
  position: absolute;
  width: 5%;
  height: 5%;
  background-color: greenyellow;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.svgLayerOnMap {
  position: absolute;
  inset: 0; /*ist för å manuellt sätta top,bottom,left, right till 0*/
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.lineBetweenDots {
  stroke: red;
  stroke-dasharray: 2 2;
  stroke-width: 6;
}
</style>
