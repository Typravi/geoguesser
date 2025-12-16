<template>
  <main>
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
    <ResponsiveNav v-bind:hideNav="hideNav">
      <button @click="switchLanguage">
        <!--denna knappen kan tas bort sen-->
        {{ uiLabels.changeLanguage }}
      </button>

      <a href="">
        {{ uiLabels.about }}
      </a>
      <a href="">FAQ</a>
      <!--gör detta till button-->
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
    </ResponsiveNav>
    <h1>{{ uiLabels["sales-pitch"] }}</h1>
    <h2>{{ uiLabels.subHeading }}</h2>

    <div class="Lobby-buttons">
      <router-link to="/JoinGameView/" class="button join-button">
        {{ uiLabels.joinGame }}
      </router-link>
      <router-link to="/create/" class="button create-button">
        {{ uiLabels.createGame }}
      </router-link>
    </div>
  </main>
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
    };
  },
  created: function () {
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);
  },
  methods: {
    switchLanguage: function () {
      this.lang = this.lang === "sv" ? "en" : "sv"; //kollar om sv isf en annars sv (vid klick)
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
  },
};
</script>
<style scoped>
header {
  background-color: gray;
  width: 100%;
  display: grid;
  grid-template-columns: 2em auto;
}
.logo {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 2.5rem;
  color: white;
  padding-top: 0.2em;
}
.logo img {
  height: 2.5rem;
  vertical-align: bottom;
  margin-right: 0.5rem;
}
.hamburger {
  color: white;
  width: 1em;
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 0.5rem;
  top: 0;
  left: 0;
  height: 2rem;
  cursor: pointer;
  font-size: 1.5rem;
}

.Lobby-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
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
  background-color: #7f8280;
}

@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left: -12em;
  }

  /* A gradient with a single color of red
radial-gradient(red)

 A gradient at the center of its container,
   starting red, changing to blue, and finishing green
radial-gradient(circle at center, red 0, blue, green 100%)


radial-gradient(circle at center in hsl longer hue, red 0, blue, green 100%)*/
}
.languageSwitch {
  position: relative;
  width: 70px;
  height: 34px;
  display: inline-block;
}

.languageSwitch input {
  display: none;
}

.languageSlider {
  position: absolute;
  inset: 0;
  background: #ccc;
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
  background: white;
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
  font-size: 16px;
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
</style>
