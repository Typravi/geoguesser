<template>
  <div
    class="outerMapWrapper"
    :style="{
      '--map-width': mapConfig.originalWidth + 'px',
      '--map-height': mapConfig.originalHeight + 'px',
      '--map-image': `url(${mapConfig.image})`,
      '--map-scale': scale,
    }"
  >
    <div class="mapWrapper">
      <div class="map" ref="map" @click="onClick"></div>
      <div id="dots">
        <!--skillnad från burger:
    1. v-if gör så att ingen markör skrivs ut om klick ej skett (i burger va den uppe t vänster)-->
        <div
          v-if="locationGuess.x !== null"
          class="guessMarker"
          v-bind:style="{
            left: locationGuess.x + 'px',
            top: locationGuess.y + 'px',
          }"
        ></div>
        <div
          v-if="correctLocation"
          class="correctMarker"
          v-bind:style="{
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
    mapConfig: {
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
      if (this.hasGuessed) return;

      const rect = this.$refs.map.getBoundingClientRect();

      const xScaled = event.clientX - rect.left;
      const yScaled = event.clientY - rect.top;

      const x = xScaled / this.scale;
      const y = yScaled / this.scale;

      this.locationGuess = { x, y };

      this.hasGuessed = true;

      this.$emit("map-click", { x, y });
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
</style>
