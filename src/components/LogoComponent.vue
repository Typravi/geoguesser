<template>
  <div class="logo">
    <img src="/img/ChatGPT_jordklot.png" />
    {{ text }}
    <img src="/img/ChatGPT_jordklot.png" />
  </div>
</template>

<script>
export default {
  name: "LogoComponent",
  props: {
    text: {
      type: String,
      required: true,
      default: "",
    },
  },
};
</script>

<style>
.logo {
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 4.5rem;
  color: var(--logo-color);
  padding-top: 0.2em;
  font-family: var(--logo-font);
}
.logo img {
  height: 2.5rem;
  vertical-align: bottom;
  margin-right: 0.5rem;
}

/*--Nedan kmr från StartView-------------------------------------------------------------- */

@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
    letter-spacing: 0.15em;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.4em;
  }

  .logo img {
    height: 5vw;
    margin: 0 0.6em;
  }
}
</style>
