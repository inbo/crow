<template>
  <div id="app">
    <navbar />
    <router-view />
    <page-footer />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueRouter from "vue-router";
import "es6-promise/auto"
import { Route } from "vue-router";
import Home from "@/components/Home.vue";
import PageNotFound from "@/components/PageNotFound.vue";
import Navbar from "@/components/Navbar.vue";
import PageFooter from "@/components/PageFooter.vue";
import VueClipboard from "vue-clipboard2";

Vue.use(VueClipboard);
Vue.use(VueRouter);

import store from "./store/index";

const routes = [
  {
    path: "/",
    component: Home,
    props: (route: Route): unknown => ({
      radarValueProp: route.query.radar,
      dateValueProp: route.query.date,
      intervalValueProp: route.query.interval,
      timeDisplayValueProp: route.query.timedisplay,
      vpChartSelectedSchemeProp: route.query.vpColorScheme,
      vpiChartModeProp: route.query.vpiMode,
      langCodeProp: route.query.lang,
    })
  }, // Example URL: http://localhost:8080/#/?radar=bezav
  { path: "*", component: PageNotFound }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default Vue.extend({
  router,
  store,
  name: "App",
  components: {
    Navbar,
    PageFooter
  },
});
</script>

<style>
main {
  min-height: calc(
    100vh - 54px
  ); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: 30px; /* Don't stick to footer */
}

.container-xl {
  max-width: 1400px; /* Increase from default 1140px to allow space for chart */
}

/* Colours and style */
.navbar {
  background-color: white!important;
  border-bottom: 1px solid #e9ecef;
}

.bg-dark {
  background-color: #2c2c2c!important; /* Slightly darker than #343a4f to improve contrast with text */
}

footer {
  border-top: 5px solid #e9ecef;
  font-size: 0.9rem;
  padding: 15px 0;
  }
  footer a,
  footer a:hover,
  footer a:visited {
    color: white;
  }
</style>
