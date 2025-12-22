<template>
  <footer>
    <div class="footerLogo">
      <LogoComponent :text="uiLabels.ourName" />
    </div>
  </footer>
</template>

<script>
import LogoComponent from "../../components/LogoComponent.vue";
import io from "socket.io-client";

const socket = io("localhost:3000");

export default {
  components: { LogoComponent },
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
    };
  },
  created() {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);
  },
};
</script>

<style>
.footerLogo {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem 1rem;
}
</style>
