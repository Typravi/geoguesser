<template>
  <div class="gridstyleWrapper">
    <!--wrapper till gridlayouten-->
    <header class="header">
      <LogoComponent :text="uiLabels.ourName" />
    </header>

    <div class="leftGridColumn">
      <!--vänstra området i gridlayouten-->
      <label class="languageSwitch">
        <input
          type="checkbox"
          :checked="lang === 'sv'"
          @change="switchLanguage"
        />
        <span class="languageSlider">
          <span class="emoji sweEmoji">🇸🇪</span>
          <span class="emoji engEmoji">🇬🇧</span>
        </span>
      </label>
    </div>
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
      <button class="button FAQ-button" @click="open = true">FAQ</button>
      <!--byt ut "FAQ" till ett label senare-->
      <div v-if="open" class="overlay" @click.self="closeFAQ">
        <!--gör så att FAQ-modalen stängs om man klickar utanför den-->
        <div class="FAQmodal">
          <div class="FAQaccordion">
            <!--accordion=rullgardinsmeny (betyder egentligen dragspel tror jag)-->

            <button class="FAQquestion" @click="FAQtoggle(0)">
              {{ uiLabels.gameInstructionsQ }}
            </button>
            <div v-show="active === 0" class="FAQanswer">
              {{ uiLabels.gameInstructionsA }}
            </div>
            <button class="FAQquestion" @click="FAQtoggle(1)">
              {{ uiLabels.creditsQ }}
            </button>
            <div v-show="active === 1" class="FAQanswer">
              {{ uiLabels.creditsA }}
            </div>
            <button class="closeFAQbutton" @click="closeFAQ">
              {{ uiLabels.close }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogoComponent from "../components/LogoComponent.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "StartView",
  components: { LogoComponent },
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

.gridstyleWrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header header header"
    "leftGridColumn mainArea rightGridColumn";
  min-height: 100vh;
}

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

.header {
  grid-area: header;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem 2rem;
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
.join-button {
  background-color: var(--joinbutton-color);
}
/*------------------------------------------------------------------------------------------------ */
.FAQ-button {
  background-color: var(--button-purplecolor);
  width: 8rem;
  margin: 2rem;
}
/*------------------------------------------------------------------------------------------------ */
.languageSwitch {
  position: relative;
  width: 70px;
  height: 34px;
  display: inline-block;
  margin: 2rem;
}

.languageSwitch input {
  display: none;
}

.languageSlider {
  position: absolute;
  inset: 0;
  background: var(--languageSwitch-BG); /*färgen på slidern om ej icheckad */
  border-radius: 34px;
  cursor: pointer;
  transition: 0.3s;
}

.languageSlider::before {
  content: "";
  position: absolute;
  width: 28px;
  height: 28px;
  left: 3px;
  top: 3px;
  background: var(--languageSwitch-circle);
  border-radius: 50%;
  transition: 0.3s;
  z-index: 2;
}

.languageSwitch input:checked + .languageSlider {
  background: var(--languageSwitch-BG); /*färgen på slidern om icheckad */
}

.languageSwitch input:checked + .languageSlider::before {
  transform: translateX(36px);
}

/* Emojis */
.emoji {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 3;
}

.engEmoji {
  left: 8px;
}

.sweEmoji {
  right: 8px;
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
