<template>
  <div class="faq-wrapper">
    <button class="button FAQ-button" @click="open = true">
      {{ uiLabels.FAQ || "FAQ" }}
    </button>

    <div v-if="open" class="overlay" @click.self="closeFAQ">
      <div class="FAQmodal">
        <h3>{{ uiLabels.FAQ || "FAQ" }}</h3>
        <div class="FAQaccordion">
          <button class="FAQquestion" @click="FAQtoggle(0)">
            {{ uiLabels.gameInstructionsQ || "Instructions" }}
          </button>
          <div v-show="active === 0" class="FAQanswer">
            {{ uiLabels.gameInstructionsA }}
          </div>

          <button class="FAQquestion" @click="FAQtoggle(1)">
            {{ uiLabels.numOfPlayersQ || "No. of players" }}
          </button>
          <div v-show="active === 1" class="FAQanswer">
            {{ uiLabels.numOfPlayersA }}
          </div>

          <button class="FAQquestion" @click="FAQtoggle(2)">
            {{ uiLabels.creditsQ || "Credits" }}
          </button>
          <div v-show="active === 2" class="FAQanswer">
            {{ uiLabels.creditsA }}
          </div>

          <button class="closeFAQbutton" @click="closeFAQ">
            {{ uiLabels.close || "Close" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FAQComponent",
  props: {
    uiLabels: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      open: false,
      active: null,
    };
  },
  methods: {
    FAQtoggle(i) {
      this.active = this.active === i ? null : i;
    },
    closeFAQ() {
      this.open = false;
      this.active = null;
    },
  },
};
</script>

<style scoped>
.button {
  display: inline-block;
  width: 10rem;
  padding: 0.8rem 2rem;
  color: var(--button-textcolor);
  border-radius: 10px;
  text-decoration: none; /* tar bort blå underline */
  font-size: 1rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.FAQ-button {
  background-color: var(--button-purplecolor);
  margin: 2rem;
}
.FAQ-button:hover {
  background-color: var(--button-purplecolor-hover);
}
.FAQ-button {
  background-color: var(--button-purplecolor);
  width: 70px;
  height: 34px;
  border-radius: 34px;
  margin: 2rem;
  display: flex;
  align-items: center; /* vertical centering */
  justify-content: center; /* horizontal centering */
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
