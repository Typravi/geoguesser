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

      <div class="Game-buttons">
        <router-link to="/JoinGameView/" class="button join-button">
          {{ uiLabels.joinGame }}
        </router-link>
        <router-link to="/create/" class="button create-button">
          {{ uiLabels.createGame }}
        </router-link>
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
sessionStorage.setItem("dataServer", "192.168.0.33:3000"); // lägger till dataseverns IP-adress i sessionStorage Ivars hemma wiFi
//sessionStorage.setItem("dataServer", "localhost:3000"); // för testning på lokal dator
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
/*------------------------------------------------------------------------------------------------ */

.Game-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.button {
  display: inline-block;
  width: 10rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.create-button {
  background-color: var(--createbutton-color);
}
.create-button:hover {
  background-color: var(--createbutton-color-hover);
}
.join-button {
  background-color: var(--joinbutton-color);
}
.join-button:hover {
  background-color: var(--joinbutton-color-hover);
}
/*------------------------------------------------------------------------------------------------ */
.FAQ-button {
  background-color: var(--button-purplecolor);
  width: 8rem;
  margin: 2rem;
  
}
.FAQ-button:hover {
  background-color: var(--button-purplecolor-hover);
}

/*------------------------------------------------------------------------------------------------ */

.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-BG); /* genomskinlig */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* undvika problem me att saker hamnar över, kan ev tas bort i slutversion */
}

.FAQmodal {
  background: var(--FAQ-modal-BG);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  padding: 1.5rem;
  border-radius: 16px;
  overflow-y: auto;
  box-sizing: border-box;
}

.FAQaccordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.FAQquestion {
  width: 100%;
  text-align: left;
  background: var(--FAQ-Q-color);
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.FAQquestion:hover {
  background: var(--FAQ-Q-hover-color);
  color: var(--FAQ-Q-hover-textcolor);
}

.FAQanswer {
  padding: 0.75rem 1rem 1rem;
  background: var(--FAQ-A-color);
  border-radius: 0 0 12px 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--FAQ-A-textcolor);
}

.closeFAQbutton {
  align-self: flex-end;

  margin-top: 1rem;
  padding: 0.6rem 1.2rem;

  border: none;
  border-radius: 10px;

  background: var(--FAQ-closebutton-color);
  color: var(--FAQ-closebutton-textcolor);
  font-weight: 600;

  cursor: pointer;
  transition: background 0.2s ease;
}

.closeFAQbutton:hover {
  background: var(--FAQ-closebutton-hover-color);
}

/*------------------------------------------------------------------------------------------------ */
</style>
