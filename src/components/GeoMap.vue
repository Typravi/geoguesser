<template>
  <div
    class="outerWrapper"
    :style="{
      '--map-width': mapConfig.originalWidth + 'px',
      '--map-height': mapConfig.originalHeight + 'px',
      '--map-image': `url(${mapConfig.image})`,
      '--map-scale': scale,
    }"
  >
    <div class="mapWrapper">
      <div class="map" ref="map" @click="onClick"></div>
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
  },

  methods: {
    onClick(event) {
      if (this.disabled) return;

      const rect = this.$refs.map.getBoundingClientRect();

      const xScaled = event.clientX - rect.left;
      const yScaled = event.clientY - rect.top;

      const x = xScaled / this.scale;
      const y = yScaled / this.scale;

      this.$emit("map-click", { x, y });
    },
  },
};
</script>

<style scoped>
.outerWrapper {
  display: flex;
  justify-content: center; /* ← detta fungerar nu */
  align-items: flex-start;
  width: 100%;
  height: 100%;
  overflow: auto; /* scroll här */
  background-color: aqua;
}

.mapWrapper {
  display: inline-block;
  width: calc(var(--map-width) * var(--map-scale)); /* ← kritiskt */
  height: calc(var(--map-height) * var(--map-scale)); /* ← kritiskt */
  transform-origin: top left;
  transform: scale(var(--map-scale));
  border: 20px solid pink;
  /* NO overflow here */
}

.map {
  width: var(--map-width);
  height: var(--map-height);
  background-image: var(--map-image);
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
