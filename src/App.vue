<template>
  <div id="app">
    <b-container fluid class="px-0">
      <b-row>
        <b-col>
          <Crow-navbar />
        </b-col>
      </b-row>
    </b-container>

    <b-container>
      <Crow />
    </b-container>

    <b-container fluid class="px-0">
      <b-row>
        <b-col><hr /></b-col>
      </b-row>

      <b-row>
        <b-col class="text-center">
            Made with ❤️ and 
            <img id="cr-vue-logo" alt="Vue logo" src="./assets/logo.png" />
            by the <a href="https://oscibio.inbo.be/">Open science lab for biodiversity</a>
        </b-col>
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
    Crow,
    CrowNavbar
  }
};
</script>

<style>
#app #cr-vue-logo {
  width: 20px;
}
</style>
