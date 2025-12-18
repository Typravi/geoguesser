<template>
  <div class="gridstyleWrapper">
    <!--wrapper till gridlayouten-->
    <header>
      <div
        v-bind:class="['hamburger', { close: !hideNav }]"
        v-on:click="toggleNav"
      ></div>
      <div class="logo">
        <img src="/img/jordklot.jpg" />
        Geoguesser
        <img src="/img/jordklot.jpg" />
      </div>
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
          <span class="emoji sweEmoji">🇬🇧</span>
          <span class="emoji engEmoji">🇸🇪</span>
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
            <button class="FAQquestion" @click="FAQtoggle(2)">Fråga 3</button>
            <div v-show="active === 2" class="FAQanswer">Svar 3</div>
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
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "StartView",
  components: {
    ResponsiveNav,
  },
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

header {
  grid-area: header;
  width: 100%;
  display: grid;
  grid-template-columns: 2em auto;
  padding: 1rem 2rem;
}
.logo {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 4.5rem;
  color: rgb(120, 159, 211);
  padding-top: 0.2em;
  font-family: Atop;
}
.logo img {
  height: 2.5rem;
  vertical-align: bottom;
  margin-right: 0.5rem;
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
  background-color: rgb(57, 142, 57);
  color: white;
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1.2rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.create-button {
  background-color: #95b29f;
}

.FAQ-button {
  background-color: rgba(108, 92, 231, 0.15);
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
  background: rgba(252, 245, 255, 0.1);
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
  background: #ffffff;
  border-radius: 50%;
  transition: 0.3s;
  z-index: 2;
}

.languageSwitch input:checked + .languageSlider {
  background: #6c5ce7;
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
  opacity: 1;
}

.sweEmoji {
  right: 8px;
  opacity: 0;
}

.languageSwitch input:checked + .languageSlider .engEmoji {
  opacity: 0;
}

.languageSwitch input:checked + .languageSlider .sweEmoji {
  opacity: 1;
}
/*------------------------------------------------------------------------------------------------ */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55); /* genomskinlig */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* undvika problem me att saker hamnar över, kan ev tas bort i slutversion */
}

.FAQmodal {
  background: #f6f7fb;
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
  background: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.FAQquestion:hover {
  background: rgba(108, 92, 231, 0.15);
  color: #2d2e32;
}

.FAQanswer {
  padding: 0.75rem 1rem 1rem;
  background: rgba(238, 197, 255, 0.1);
  border-radius: 0 0 12px 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
}

.closeFAQbutton {
  align-self: flex-end;

  margin-top: 1rem;
  padding: 0.6rem 1.2rem;

  border: none;
  border-radius: 10px;

  background: #6c5ce7;
  color: white;
  font-weight: 600;

  cursor: pointer;
  transition: background 0.2s ease;
}

.closeFAQbutton:hover {
  background: #5a4bd6;
}

/*------------------------------------------------------------------------------------------------ */

@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
/*------------------------------------------------------------------------------------------------ */
</style>
