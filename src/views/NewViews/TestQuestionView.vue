<template>
  <!-- Här ska html in -->
  <div class="main">
    <p>hej</p>
  </div>

  <div class="mapWrapper">
    <div id="map"></div>
  </div>
</template>

<script>
/* Här ska JavaScript in */
//Enkelradskommentar i JS
</script>

<style>
/* Här ska CSS in */
/* För omskalning av kartan se:
 https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/transform-function/scale */
/* Kartan har originalstorlek 2395x2049 */
/* Obs i framtiden, dela även clickpos med scale var */
.main {
  background-color: black;
}

p {
  color: azure;
  font-size: 48pt;
}

.outerWrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.mapWrapper {
  transform: scale(0.24);
  transform-origin: top left;
  width: 2395px;
  height: 2049px;
  overflow: hidden;
  /*Är lite osäker på om scroll eller hidden är bäst */
}

#map {
  position: relative;
  width: 2395px;
  height: 2049px;
  background: url("/img/Europe_map.png");
  background-size: cover;
  /*Är lite osäker på om cover eller contain är bäst
  https://www.cssmine.com/ebook/css3-background-size */
  background-repeat: no-repeat;
}
</style>
