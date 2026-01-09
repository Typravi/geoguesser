<template>
  <div class="page-wrapper StartView">
    <!--wrapper till gridlayouten-->
    <header class="app-header">
      <div class="header-lang">
        <LanguageComponent :lang="lang" @switchLang="switchLanguage" />
      </div>
      <LogoComponent :text="uiLabels.ourName" />
      <div class="header-faq">
        <FAQComponent :uiLabels="uiLabels" />
      </div>
    </header>

    <main class="mainArea">
      <!--mittenområdet i gridlayouten-->
      <div class="greeting">
        <h1>{{ uiLabels["sales-pitch"] }}</h1>
        <h2>{{ uiLabels.subHeading }}</h2>
      </div>


      <div class="buttonArea">
        <div class="Game-buttons">
          <router-link to="/JoinGameView/" class="button join-button">
            {{ uiLabels.joinGame }}
          </router-link>
          <router-link to="/create/" class="button create-button">
            {{ uiLabels.createGame }}
          </router-link>
        </div>
      </div>
    </main>
    <div class="rightGridColumn">
      
    </div>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import LanguageComponent from "../components/LanguageComponent.vue";
import FAQComponent from "../components/FAQComponent.vue";
import io from "socket.io-client";
//sessionStorage.setItem("dataServer", "192.168.0.33:3000"); // lägger till dataseverns IP-adress i sessionStorage Ivars hemma wiFi
sessionStorage.setItem("dataServer", "localhost:3000"); // för testning på lokal dator
const socket = io(sessionStorage.getItem("dataServer")); // ändrat från localhost till min lokala IP-adress

export default {
  name: "StartView",
  components: { LogoComponent , LanguageComponent, FAQComponent},
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,
      open: false,
      active: null,
    };
  },
  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om SV isf EN annars SV (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
    FAQtoggle: function (i) {
      this.active = this.active === i ? null : i;
    },
    closeFAQ: function () {
      this.open = false;
      this.active = null;
    },
  },
};
</script>
<style scoped>
/*------------------------------------------------------------------------------------------------ */



.leftGridColumn {
  grid-area: leftGridColumn;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
}
.mainArea {
  grid-area: mainArea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.rightGridColumn {
  grid-area: rightGridColumn;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}

/*------------------------------------------------------------------------------------------------ */

.greeting {
  font-size: smaller;
}

.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-BG); /* genomskinlig */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* undvika problem me att saker hamnar över, kan ev tas bort i slutversion */
}



/*------------------------------------------------------------------------------------------------ */
</style>
