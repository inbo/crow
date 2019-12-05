<template>
  <div id="app">
    <b-container-fluid>
      <Crow-navbar />
    </b-container-fluid>

    <b-container>
      <b-row>
        <Crow />
      </b-row>

      <b-row>
        <div class="mx-auto">
          Made with:
          <img id="cr-vue-logo" alt="Vue logo" src="./assets/logo.png" />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Crow from "./components/Crow.vue";
import CrowNavbar from "./components/CrowNavbar.vue";

export default {
  name: "app",
  components: {
    Crow, CrowNavbar
  }
};
</script>

<style>
#app #cr-vue-logo {
  width: 32px;
}
</style>
