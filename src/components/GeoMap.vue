<template>
  <div class="outerWrapper">
    <div
      class="mapWrapper"
      :style="{ transform: `scale(${scale})` }"
    >
      <div
        class="map"
        ref="map"
        :style="mapStyle"
        @click="onClick"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GeoMap",

  props: {
    scale: {
      type: Number,
      default: 0.35
    },
    disabled: {
      type: Boolean,
      default: false
    },
    mapConfig: {
      type: Object,
      required: true // { image, originalWidth, originalHeight, cities: [...] }
    }
  },

  computed: {
    mapStyle() {
      return {
        width: this.mapConfig.originalWidth + "px",
        height: this.mapConfig.originalHeight + "px",
        backgroundImage: `url(${this.mapConfig.image})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        border: "20px solid red"
      };
    }
  },

  methods: {
    onClick(event) {
      if (this.disabled) return;
      const mapEl = this.$refs.map;
      const rect = mapEl.getBoundingClientRect();

      const clickXScaled = event.clientX - rect.left;
      const clickYScaled = event.clientY - rect.top;

      const clickX = clickXScaled / this.scale;
      const clickY = clickYScaled / this.scale;

      this.$emit("map-click", {
        x: clickX,
        y: clickY
      });
    }
  }
};
</script>

<style scoped>
.outerWrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.mapWrapper {
  transform-origin: top left;
  overflow: hidden;
  border: 20px solid black;
}
</style>