<template>
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
</template>

<script>
export default {
  name: "LanguageComponent",
  props: {
    lang: String // Tar emot nuvarande språk från föräldern
  },
  methods: {
    switchLanguage() {
      // Skicka signal uppåt att vi vill byta
      this.$emit("switchLang"); 
    },
    
  }
};
</script>

<style scoped>

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
</style>